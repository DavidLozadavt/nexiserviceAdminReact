import { useState, useEffect } from 'react';
import { CitaPaciente, Paciente } from '../types';

export const useListaPacientes = (medicoId: string) => {
  const [citas, setCitas] = useState<CitaPaciente[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'pendiente' | 'en_curso' | 'completada'>('pendiente');
  const [loading, setLoading] = useState(false);

  // Simular carga de citas (reemplazar con API real)
  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true);
      // Aquí iría la llamada a tu API
      // const response = await getCitasMedico(medicoId);
      
      // Mock data
      const mockCitas: CitaPaciente[] = [
        {
          id: '1',
          pacienteId: 'PAC001',
          pacienteNombre: 'Juan Carlos Pérez García',
          pacienteIdentificacion: '1234567890',
          horaCita: '08:00',
          fechaCita: new Date().toISOString().split('T')[0],
          tipoCita: 'primera_vez',
          estado: 'pendiente',
          motivoConsulta: 'Dolor de cabeza persistente',
          duracionEstimada: 30
        },
        {
          id: '2',
          pacienteId: 'PAC002',
          pacienteNombre: 'María Fernanda López Ruiz',
          pacienteIdentificacion: '0987654321',
          horaCita: '08:30',
          fechaCita: new Date().toISOString().split('T')[0],
          tipoCita: 'control',
          estado: 'en_curso',
          motivoConsulta: 'Control de hipertensión',
          duracionEstimada: 20
        },
        {
          id: '3',
          pacienteId: 'PAC003',
          pacienteNombre: 'Carlos Alberto Rodríguez',
          pacienteIdentificacion: '5678901234',
          horaCita: '09:00',
          fechaCita: new Date().toISOString().split('T')[0],
          tipoCita: 'urgencia',
          estado: 'pendiente',
          motivoConsulta: 'Dolor abdominal agudo',
          duracionEstimada: 45
        },
        {
          id: '4',
          pacienteId: 'PAC004',
          pacienteNombre: 'Ana María Gómez Torres',
          pacienteIdentificacion: '3456789012',
          horaCita: '10:00',
          fechaCita: new Date().toISOString().split('T')[0],
          tipoCita: 'seguimiento',
          estado: 'completada',
          motivoConsulta: 'Seguimiento post-operatorio',
          duracionEstimada: 25
        }
      ];
      
      setTimeout(() => {
        setCitas(mockCitas);
        setLoading(false);
      }, 500);
    };

    fetchCitas();
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
