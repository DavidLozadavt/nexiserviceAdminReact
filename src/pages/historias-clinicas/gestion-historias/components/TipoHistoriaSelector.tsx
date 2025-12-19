import React from 'react';
import { TipoHistoria } from '../types';

interface TipoHistoriaSelectorProps {
  value: TipoHistoria;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TipoHistoriaSelector: React.FC<TipoHistoriaSelectorProps> = ({ value, onChange }) => {
  const tipos = [
    { value: 'medica', label: 'Médica General', icon: 'medica', color: 'primary' },
    { value: 'fisioterapia', label: 'Fisioterapia', icon: 'fisioterapia', color: 'info' },
    { value: 'odontologica', label: 'Odontológica', icon: 'odontologica', color: 'warning' }
  ];

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

  // Función para obtener las clases según el color y si está seleccionado
  const getCardClasses = (tipo: typeof tipos[0], isSelected: boolean) => {
    if (isSelected) {
      const selectedClasses = {
        primary: 'border-primary bg-primary-light shadow-primary',
        info: 'border-info bg-info-light shadow-info',
        warning: 'border-warning bg-warning-light shadow-warning'
      };
      return selectedClasses[tipo.color as keyof typeof selectedClasses];
    }
    return 'border-gray-300 dark:border-gray-700 bg-light dark:bg-coal-400 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-light';
  };

  const getIconClasses = (tipo: typeof tipos[0], isSelected: boolean) => {
    if (isSelected) {
      const selectedClasses = {
        primary: 'bg-primary text-primary-inverse',
        info: 'bg-info text-info-inverse',
        warning: 'bg-warning text-warning-inverse'
      };
      return selectedClasses[tipo.color as keyof typeof selectedClasses];
    }
    return 'bg-gray-200 dark:bg-coal-500 text-gray-600 dark:text-gray-300';
  };

  const getTextClasses = (tipo: typeof tipos[0], isSelected: boolean) => {
    if (isSelected) {
      const selectedClasses = {
        primary: 'text-primary',
        info: 'text-info',
        warning: 'text-warning'
      };
      return selectedClasses[tipo.color as keyof typeof selectedClasses];
    }
    return 'text-gray-700 dark:text-gray-200';
  };

  return (
    <div className="bg-light-active dark:bg-coal-400 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <label className="block text-2sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Tipo de Historia Clínica <span className="text-danger">*</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tipos.map((tipo) => {
          const isSelected = value === tipo.value;
          return (
            <label
              key={tipo.value}
              className={`relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getCardClasses(tipo, isSelected)}`}
            >
              <input
                type="radio"
                name="tipo"
                value={tipo.value}
                checked={isSelected}
                onChange={onChange}
                className="sr-only"
              />
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${getIconClasses(tipo, isSelected)}`}>
                {getTipoIcon(tipo.icon)}
              </div>
              <span className={`text-2sm font-medium transition-colors ${getTextClasses(tipo, isSelected)}`}>
                {tipo.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};