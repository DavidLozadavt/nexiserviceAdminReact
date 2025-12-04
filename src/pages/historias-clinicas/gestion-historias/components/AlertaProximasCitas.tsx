import React, { useEffect } from 'react';
import { enviarRecordatorioCita } from '../historiaClinicaService';

interface Cita {
  pacienteNombre: string;
  fecha: string;
  correo?: string; // Se asume que puede venir el correo
}

interface AlertaProximasCitasProps {
  citas: Cita[];
}

export const AlertaProximasCitas: React.FC<AlertaProximasCitasProps> = ({ citas }) => {
  useEffect(() => {
    citas.forEach((cita) => {
      if (cita.correo) {
        enviarRecordatorioCita({
          correo: cita.correo,
          nombre: cita.pacienteNombre,
          fecha: cita.fecha
        });
      }
    });
   
  }, []);

  if (citas.length === 0) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
      <div className="text-xs text-green-700">Se ha enviado el recordatorio al correo del paciente.</div>
    </div>
  );
};