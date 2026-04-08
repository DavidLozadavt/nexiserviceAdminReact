
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Snackbar } from '@/components/Snackbar';
import { v4 as uuidv4 } from 'uuid';
import { HistoriaClinica, EvolucionClinica } from '../types';
import { Paciente } from '../../gestion-pacientes/types';
import { obtenerHistoriasClinicas, obtenerHistoriasClinicasPorPersonaId, obtenerAntecedentesPorHistoriaId, adjuntarArchivoAHistoria } from '../historiaClinicaService';
import { crearEvolucion } from '../../evoluciones/evolucionesService';

// Mapeo de antecedente_id a subcategoria
const ANTECEDENTE_ID_TO_SUBCATEGORIA: Record<number, string> = {
  13: 'Enfermedades previas',
  14: 'Hospitalizaciones',
  15: 'Cirugías',
  16: 'Enfermedades hereditarias',
  17: 'Medicamentos',
  18: 'Alimentos',
  19: 'Sustancias',
  20: 'Consumo de tabaco',
  21: 'Consumo de alcohol',
  22: 'Consumo de drogas',
  23: 'Medicamentos habituales',
  24: 'Vacunación',
};

// Adaptador para transformar los datos del backend
function adaptarHistoriaClinicaBackend(historia: any): HistoriaClinica {
  const examenFisicoRaw = historia.examen_fisico || {};
  // Adaptar antecedentes
  const antecedentesAdaptados = Array.isArray(historia.antecedentes)
    ? historia.antecedentes.map((a: any) => ({
        subcategoria: ANTECEDENTE_ID_TO_SUBCATEGORIA[a.antecedente_id] || `ID:${a.antecedente_id}`,
        tiene: Boolean(a.tiene),
        descripcion: a.descripcion || '',
      }))
    : [];
  return {
    ...historia,
    motivoConsulta: historia.motivo_consulta || '',
    antecedentes: antecedentesAdaptados,
    examenFisico: {
      peso: examenFisicoRaw.peso || '',
      altura: examenFisicoRaw.altura || '',
      presionArterial: examenFisicoRaw.presion_arterial || '',
      frecuenciaCardiaca: examenFisicoRaw.frecuencia_cardiaca || '',
    },
    // Mapear tratamientos del backend (posiblemente 'tratamientos') a 'tratamiento' del frontend
    tratamiento: Array.isArray(historia.tratamientos)
      ? historia.tratamientos.map((t: any) => ({
          medicamento: t.medicamento || '',
          presentacion: t.presentacion || '',
          dosis: t.dosis || '',
          como_tomar: t.como_tomar || ''
        }))
      : [],
  };
}

interface UseHistoriasManagerProps {
  paciente: Paciente;
  setHistoriasPaciente?: (historias: HistoriaClinica[]) => void;
  usuario: {
    first_name?: string;
    last_name?: string;
    username?: string;
  } | null;
}

export const useHistoriasManager = ({ 
  paciente, 
  setHistoriasPaciente, 
  usuario 
}: UseHistoriasManagerProps) => {
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [historiaEditando, setHistoriaEditando] = useState<HistoriaClinica | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type?: 'error' | 'success' | 'info' | 'warning' } | null>(null);

  // Consultar historias clínicas al montar o cambiar paciente
  useEffect(() => {
    async function fetchHistorias() {
      try {
          const historiasBackend = await obtenerHistoriasClinicasPorPersonaId(String(paciente.id));
  // console.log eliminado
        // Solo adaptar la historia, sin antecedentes
        const historiasAdaptadas = Array.isArray(historiasBackend)
          ? historiasBackend.map((historia: any) => adaptarHistoriaClinicaBackend(historia))
          : [];
        setHistorias(historiasAdaptadas);
      } catch (e) {
        setHistorias([]);
      }
    }
    if (paciente?.id) {
      fetchHistorias();
    }
  }, [paciente?.id]);
  // Cargar antecedentes solo cuando se selecciona una historia
  const cargarAntecedentesHistoria = async (historiaId: string | number) => {
    try {
      const antecedentes = await obtenerAntecedentesPorHistoriaId(historiaId);
      setHistorias(prev => prev.map(h =>
        h.id === historiaId ? { ...h, antecedentes } : h
      ));
    } catch (e) {
      // Si falla, no modifica antecedentes
    }
  };

  // Log para comparar persona_id y paciente.id
  // useEffect para logs eliminado

  const historiasPaciente = useMemo(
    () => historias.filter(h => String(h.persona_id) === String(paciente.id)),
    [historias, paciente.id]
  );

  const actualizarHistoriasPaciente = useCallback(() => {
    if (setHistoriasPaciente) {
      setHistoriasPaciente(historiasPaciente);
    }
  }, [historiasPaciente, setHistoriasPaciente]);

  useEffect(() => {
    actualizarHistoriasPaciente();
  }, [actualizarHistoriasPaciente]);

  const getNombreUsuario = useCallback(() => {
    return usuario?.first_name 
      ? `${usuario.first_name} ${usuario.last_name || ''}`.trim() 
      : usuario?.username || 'Desconocido';
  }, [usuario]);

  const handleGuardarHistoria = useCallback(async (historia: HistoriaClinica) => {
    // Después de crear/editar, refrescar desde el backend
    try {
        const historiasBackend = await obtenerHistoriasClinicasPorPersonaId(String(paciente.id));
      const historiasAdaptadas = Array.isArray(historiasBackend)
        ? historiasBackend.map(adaptarHistoriaClinicaBackend)
        : [];
      setHistorias(historiasAdaptadas);
    } catch (e) {
      // fallback local si falla el fetch
      const now = new Date();
      const fechaActual = now.toLocaleString();
      const usuarioActual = getNombreUsuario();
      if (historiaEditando) {
        setHistorias(prev => prev.map(h =>
          h.id === historiaEditando.id
            ? {
                ...historia,
                pacienteId: paciente.id,
                id: historiaEditando.id,
                historialCambios: [
                  ...(h.historialCambios || []),
                  {
                    fecha: fechaActual,
                    usuario: usuarioActual,
                    motivo: 'Edición de historia clínica',
                  },
                ],
                fechaCreacion: h.fechaCreacion,
                adjuntos: historia.adjuntos || [],
              }
            : h
        ));
      } else {
        setHistorias(prev => [
          ...prev,
          {
            ...historia,
            pacienteId: paciente.id,
            id: historia.id || (Math.random() + '').slice(2),
            fechaCreacion: fechaActual,
            historialCambios: [
              {
                fecha: fechaActual,
                usuario: usuarioActual,
                motivo: 'Creación de historia clínica',
              },
            ],
            adjuntos: historia.adjuntos || [],
          },
        ]);
      }
    }
    setHistoriaEditando(null);
  }, [historiaEditando, paciente.id, getNombreUsuario]);

  const handleAdjuntarArchivo = useCallback(async (historiaId: string, file: File) => {
    // Validar tamaño máximo (5MB)
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setSnackbar({ message: `El archivo supera el tamaño máximo permitido de ${maxSizeMB}MB.`, type: 'error' });
      return;
    }
    try {
      const adjunto = await adjuntarArchivoAHistoria(historiaId, file);
      setHistorias(prev =>
        prev.map(h =>
          h.id === historiaId
            ? { ...h, adjuntos: [...(h.adjuntos || []), adjunto] }
            : h
        )
      );
      setSnackbar({ message: 'Archivo adjuntado correctamente.', type: 'success' });
    } catch (error) {
      setSnackbar({ message: 'Error al subir el archivo al servidor.', type: 'error' });
    }
  }, []);

  const handleAddEvolucion = useCallback(async (historiaId: string, nuevaEvolucion: EvolucionClinica) => {
    try {
      // Adaptar los campos para el backend
      const payload = {
        historias_clinicas_id: Number(historiaId),
        fecha: nuevaEvolucion.fecha,
        descripcion: nuevaEvolucion.descripcion,
        firma_digital: nuevaEvolucion.firmaDigital ?? '',
        responsable: nuevaEvolucion.responsable,
        proxima_cita: nuevaEvolucion.proximaCita ?? '',
      };
      const evolucionGuardada = await crearEvolucion(payload);
      // Actualizar el estado local solo si la petición fue exitosa
      setHistorias(prev =>
        prev.map(h =>
          h.id === historiaId
            ? { ...h, evoluciones: [
                {
                  ...nuevaEvolucion,
                  id: evolucionGuardada.id || nuevaEvolucion.id,
                  firmaDigital: evolucionGuardada.firma_digital || nuevaEvolucion.firmaDigital,
                  proximaCita: evolucionGuardada.proxima_cita || nuevaEvolucion.proximaCita,
                },
                ...(h.evoluciones || [])
              ] }
            : h
        )
      );
      setSnackbar({ message: 'Evolución guardada correctamente.', type: 'success' });
    } catch (error) {
      setSnackbar({ message: 'Error al guardar la evolución en el servidor.', type: 'error' });
    }
  }, []);

  return {
    historiasPaciente,
    historiaEditando,
    setHistoriaEditando,
    handleGuardarHistoria,
    handleAdjuntarArchivo,
    handleAddEvolucion,
    getNombreUsuario,
    cargarAntecedentesHistoria,
    snackbar,
    setSnackbar,
  };
};