import React from 'react';

interface EmptyStateProps {
  onNuevaHistoria: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNuevaHistoria }) => {
  return (
    <div className="bg-white rounded-xl shadow-card border-2 border-dashed border-gray-300 overflow-hidden">
      <div className="px-7.5 py-16 text-center">
        {/* Ícono grande con animación */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-primary-light rounded-2xl blur-xl opacity-50"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-primary-light to-white rounded-2xl flex items-center justify-center mx-auto border-2 border-primary-clarity">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Título y descripción */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No hay historias clínicas
        </h3>
        <p className="text-2sm text-gray-600 max-w-md mx-auto mb-8">
          Este paciente no tiene historias clínicas registradas. Comienza creando la primera historia clínica para iniciar el seguimiento médico.
        </p>

        <button
          onClick={onNuevaHistoria}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-active hover:from-primary-active hover:to-primary text-white rounded-xl transition-all duration-200 font-semibold shadow-primary hover:shadow-lg transform hover:-translate-y-0.5 text-2sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Crear Historia Clínica
        </button>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-2xs text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Registro seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Confidencial</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Acceso rápido</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};