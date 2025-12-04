import { useState, useEffect } from 'react';
import { CitaPaciente } from '../types';
import { obtenerReservas } from '../pacientesService'; 

// Función para mapear la agenda del backend al formato CitaPaciente
function mapAgendaToCitaPaciente(agenda: any): CitaPaciente {
  const asignacion = agenda.asignaciones_responsables?.[0] || {};
  const cliente = asignacion.cliente || {};

  return {
    id: String(agenda.id),
    pacienteId: cliente.identificacion || '', // Usar la cédula para búsquedas
    pacienteNombre: cliente.nombre || '',
    pacienteIdentificacion: cliente.identificacion || '',
    horaCita: agenda.horaInicial || agenda.horaFinal || agenda.horainicial || '',
    fechaCita: agenda.fechaFinal || agenda.fechaInicial || '',
    tipoCita: agenda.nota?.toLowerCase().includes('medica') ? 'primera_vez' : (agenda.nota?.toLowerCase().includes('urgencia') ? 'urgencia' : 'control'),
    estado: agenda.estado?.toLowerCase() === 'agendado' ? 'pendiente' : agenda.estado?.toLowerCase() || 'pendiente',
    motivoConsulta: agenda.descripcion || agenda.nota || '',
    duracionEstimada: undefined // Si tienes duración, mapea aquí
  };
}

export const useListaPacientes = (medicoId: string) => {
  const [citas, setCitas] = useState<CitaPaciente[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'pendiente' | 'en_curso' | 'completada'>('pendiente');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      try {
        const data = await obtenerReservas();
        console.log('Respuesta /agendas:', data);
        setCitas(data.map(mapAgendaToCitaPaciente)); 
      } catch (error) {
        setCitas([]);
      }
      setLoading(false);
    };
    fetchReservas();
  }, [medicoId]);

  const citasFiltradas = citas.filter(cita => {
    return filtro === 'todas' || cita.estado === filtro;
  });

  const getCitasPorEstado = (estado: CitaPaciente['estado']) => {
    return citas.filter(c => c.estado === estado).length;
  };

  return {
    citas: citasFiltradas,
    filtro,
    loading,
    setFiltro,
    estadisticas: {
      total: citas.length,
      pendientes: getCitasPorEstado('pendiente'),
      enCurso: getCitasPorEstado('en_curso'),
      completadas: getCitasPorEstado('completada')
    }
  };
};