import React from 'react';

interface EstadisticasPacientesProps {
  totalPacientes: number;
}

export const EstadisticasPacientes: React.FC<EstadisticasPacientesProps> = ({ totalPacientes }) => {
  if (totalPacientes === 0) return null;

  return (
    <div className="bg-gradient-to-br from-primary-light to-white rounded-xl p-5 border border-primary-clarity">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-primary">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <span className="text-2sm font-medium text-gray-600 block">
              Total de pacientes registrados
            </span>
            <span className="text-2xl font-bold text-primary">
              {totalPacientes}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xs text-gray-500 uppercase tracking-wider font-semibold block mb-1">
            Estado del sistema
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs text-success font-semibold">Operativo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
