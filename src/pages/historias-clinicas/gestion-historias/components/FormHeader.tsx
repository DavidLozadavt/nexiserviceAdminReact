import React from 'react';
import { TipoHistoria } from '../types';

interface FormHeaderProps {
  isEdit: boolean;
  tipo: TipoHistoria;
}

const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case 'medica':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'fisioterapia':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'odontologica':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 015 0H17" />
        </svg>
      );
    default:
      return null;
  }
};

const getTipoBadgeColor = (tipo: string) => {
  switch (tipo) {
    case 'medica':
      return 'bg-primary-light text-primary border border-primary-clarity';
    case 'fisioterapia':
      return 'bg-info-light text-info border border-info-clarity';
    case 'odontologica':
      return 'bg-warning-light text-warning border border-warning-clarity';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const FormHeader: React.FC<FormHeaderProps> = ({ isEdit, tipo }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-light via-transparent to-transparent opacity-60"></div>
      <div className="relative px-7.5 py-5 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-active rounded-xl flex items-center justify-center shadow-primary flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-1.5xl font-semibold text-gray-900 mb-1">
                {isEdit ? 'Editar Historia Clínica' : 'Nueva Historia Clínica'}
              </h2>
              <p className="text-2sm text-gray-600">
                {isEdit ? 'Actualiza la información médica del paciente' : 'Registra la información médica del paciente'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg ${getTipoBadgeColor(tipo)} flex items-center gap-2 text-2sm font-medium flex-shrink-0`}>
            {getTipoIcon(tipo)}
            <span className="capitalize hidden sm:inline">{tipo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
