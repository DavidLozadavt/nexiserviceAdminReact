import React from 'react';

interface EstadisticasCitasProps {
  total: number;
  pendientes: number;
  enCurso: number;
  completadas: number;
}

export const EstadisticasCitas: React.FC<EstadisticasCitasProps> = ({
  total,
  pendientes,
  enCurso,
  completadas
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-primary-light to-white p-4 rounded-xl border border-primary-clarity">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xs text-gray-600 font-medium uppercase tracking-wider mb-1">Total</p>
            <p className="text-2xl font-bold text-primary">{total}</p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-warning-light to-white p-4 rounded-xl border border-warning-clarity">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xs text-gray-600 font-medium uppercase tracking-wider mb-1">Pendientes</p>
            <p className="text-2xl font-bold text-warning">{pendientes}</p>
          </div>
          <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-info-light to-white p-4 rounded-xl border border-info-clarity">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xs text-gray-600 font-medium uppercase tracking-wider mb-1">En Curso</p>
            <p className="text-2xl font-bold text-info">{enCurso}</p>
          </div>
          <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-success-light to-white p-4 rounded-xl border border-success-clarity">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xs text-gray-600 font-medium uppercase tracking-wider mb-1">Completadas</p>
            <p className="text-2xl font-bold text-success">{completadas}</p>
          </div>
          <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
