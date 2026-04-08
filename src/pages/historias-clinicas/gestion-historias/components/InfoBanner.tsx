import React from 'react';

export const InfoBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-info-light via-primary-light to-info-light dark:from-info-clarity dark:via-primary-clarity dark:to-info-clarity rounded-xl p-5 border border-info-clarity">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center flex-shrink-0 shadow-info">
          <svg className="w-5 h-5 text-info-inverse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-2sm font-semibold text-info mb-1.5">Información importante</h4>
          <p className="text-3xs text-gray-700 dark:text-gray-300 leading-relaxed">
            Asegúrate de completar todos los campos obligatorios (*). Esta información será parte del registro médico permanente del paciente y debe ser precisa y completa.
          </p>
        </div>
      </div>
    </div>
  );
};