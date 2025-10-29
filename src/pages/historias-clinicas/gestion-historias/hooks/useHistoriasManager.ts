import { useState, useMemo, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { HistoriaClinica, EvolucionClinica } from '../types';
import { Paciente } from '../../gestion-pacientes/types';

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

  const historiasPaciente = useMemo(
    () => historias.filter(h => h.pacienteId === paciente.id),
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

  const handleGuardarHistoria = useCallback((historia: HistoriaClinica) => {
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
    setHistoriaEditando(null);
  }, [historiaEditando, paciente.id, getNombreUsuario]);

  const handleAdjuntarArchivo = useCallback((historiaId: string, file: File) => {
    const url = URL.createObjectURL(file);
    const adjunto = {
      id: uuidv4(),
      nombre: file.name,
      url,
      tipo: file.type,
    };
    setHistorias(prev =>
      prev.map(h =>
        h.id === historiaId
          ? { ...h, adjuntos: [...(h.adjuntos || []), adjunto] }
          : h
      )
    );
  }, []);

  const handleAddEvolucion = useCallback((historiaId: string, nuevaEvolucion: EvolucionClinica) => {
    setHistorias(prev =>
      prev.map(h =>
        h.id === historiaId
          ? { ...h, evoluciones: [nuevaEvolucion, ...(h.evoluciones || [])] }
          : h
      )
    );
  }, []);

  return {
    historiasPaciente,
    historiaEditando,
    setHistoriaEditando,
    handleGuardarHistoria,
    handleAdjuntarArchivo,
    handleAddEvolucion,
    getNombreUsuario,
  };
};