import React from 'react';
import { EvolucionClinica } from '../gestion-historias/types';
interface Props {
  evoluciones: EvolucionClinica[];
}

const EvolucionesClinicasList: React.FC<Props> = ({ evoluciones }) => (
  <div>
    {evoluciones.length === 0 ? (
      <p>No hay evoluciones clínicas registradas.</p>
    ) : (
      evoluciones.map(evolucion => (
        <div key={evolucion.id} className="mb-4 p-3 border rounded">
          <div><strong>Fecha:</strong> {evolucion.fecha}</div>
          <div><strong>Responsable:</strong> {evolucion.responsable}</div>
          <div><strong>Descripción:</strong> {evolucion.descripcion}</div>
          {evolucion.proximaCita && (
            <div className="text-info">
              <strong>Próxima cita:</strong> {evolucion.proximaCita}
            </div>
          )}
        </div>
      ))
    )}
  </div>
);

export default EvolucionesClinicasList;