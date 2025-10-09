import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="card bg-white shadow-card border border-gray-200 rounded-xl">
      <div className="px-7.5 py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-1.5xl font-semibold text-gray-900 mb-2">
          No hay historias clínicas
        </h3>
        <p className="text-2sm text-gray-600 mb-6">
          Este paciente no tiene historias clínicas registradas. Crea la primera historia clínica.
        </p>
      </div>
    </div>
  );
};