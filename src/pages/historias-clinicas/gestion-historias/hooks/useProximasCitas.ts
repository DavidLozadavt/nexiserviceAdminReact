import { useState, useEffect } from 'react';
import { HistoriaClinica } from '../types';
import { Paciente } from '../../gestion-pacientes/types';

interface Cita {
  pacienteNombre: string;
  fecha: string;
}

export const useProximasCitas = (historias: HistoriaClinica[], paciente: Paciente) => {
  const [proximasCitas, setProximasCitas] = useState<Cita[]>([]);

  useEffect(() => {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    
    const yyyy = manana.getFullYear();
    const mm = String(manana.getMonth() + 1).padStart(2, '0');
    const dd = String(manana.getDate()).padStart(2, '0');
    const fechaManana = `${yyyy}-${mm}-${dd}`;

    const evoluciones = historias
      .filter(h => String(h.persona_id) === String(paciente.id))
      .flatMap(h => 
        h.evoluciones
          ?.filter(e => !!e.proximaCita)
          .map(e => ({
            pacienteNombre: paciente.nombre1 + paciente.apellido1 ,
            fecha: e.proximaCita as string
          })) || []
      );
    
    const citas = evoluciones.filter(e => e.fecha === fechaManana);
    setProximasCitas(citas);
  }, [historias, paciente]);

  return proximasCitas;
};