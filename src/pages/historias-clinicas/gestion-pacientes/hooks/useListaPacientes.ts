import { useState, useEffect } from 'react';
import { CitaPaciente } from '../types';
import { obtenerReservas } from '../pacientesService'; 

// Función para mapear la agenda del backend al formato CitaPaciente
function mapAgendaToCitaPaciente(agenda: any): CitaPaciente {
  const asignacion = agenda.asignacionesResponsables?.[0] || {};
  const cliente = asignacion.cliente || {};

  return {
    id: String(agenda.id),
    pacienteId: String(cliente.id),
    pacienteNombre: cliente.nombre || '',
    pacienteIdentificacion: cliente.identificacion || '',
    horaCita: agenda.hora || '', // Ajusta según tu campo real
    fechaCita: agenda.fecha || '', // Ajusta según tu campo real
    tipoCita: 'primera_vez', // O mapea según tu lógica
    estado: agenda.estado?.toLowerCase() || 'pendiente',
    motivoConsulta: agenda.nota || '',
    duracionEstimada: undefined // Si tienes este dato, mapea aquí
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