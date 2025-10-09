import React from 'react';

interface Cita {
  pacienteNombre: string;
  fecha: string;
}

interface AlertaProximasCitasProps {
  citas: Cita[];
}

export const AlertaProximasCitas: React.FC<AlertaProximasCitasProps> = ({ citas }) => {
  if (citas.length === 0) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
      <strong>Recordatorio:</strong> Tienes citas próximas mañana:
      <ul className="mt-2 list-disc list-inside">
        {citas.map((cita, idx) => (
          <li key={idx}>
            Paciente: <span className="font-semibold">{cita.pacienteNombre}</span> — Fecha: <span className="font-semibold">{cita.fecha}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 text-xs text-gray-600">(Simulación: aquí se enviaría el correo al paciente)</div>
    </div>
  );
};