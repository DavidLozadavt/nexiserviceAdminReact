import React from 'react';
import { EvolucionClinica } from '../types';

interface EvolucionesSectionProps {
  evoluciones?: EvolucionClinica[];
}

export const EvolucionesSection: React.FC<EvolucionesSectionProps> = ({ evoluciones }) => {
  if (!evoluciones || evoluciones.length === 0) return null;

  return (
    <div className="mt-8">
      <h4 className="text-2sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Evoluciones Clínicas</h4>
      <div className="space-y-4">
        {evoluciones
          .slice()
          .sort((a, b) => b.fecha.localeCompare(a.fecha))
          .map(evolucion => (
            <div key={evolucion.id} className="bg-light-active dark:bg-coal-400 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2sm font-medium text-gray-800 dark:text-gray-100">{evolucion.fecha}</span>
                <span className="text-3xs text-gray-500 dark:text-gray-500">{evolucion.responsable}</span>
              </div>
              <div className="text-2sm text-gray-900 dark:text-gray-200 mb-2">{evolucion.descripcion}</div>
              {evolucion.firmaDigital && (
                <div className="mt-2">
                  <span className="text-3xs text-gray-600 dark:text-gray-400">Firma digital:</span>
                  <img src={evolucion.firmaDigital} alt="Firma digital" className="max-h-20 mt-1" />
                </div>
              )}
              {evolucion.proximaCita && (
                <div className="mt-2 text-3xs text-info">
                  <strong>Próxima cita:</strong> {evolucion.proximaCita}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};