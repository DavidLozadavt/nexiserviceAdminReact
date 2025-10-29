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

  return (
    <div className="bg-gray-100 rounded-xl p-5 border border-gray-200">
      <label className="block text-2sm font-semibold text-gray-900 mb-4">
        Tipo de Historia Clínica <span className="text-danger">*</span>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tipos.map((tipo) => (
          <label
            key={tipo.value}
            className={`relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              value === tipo.value
                ? `border-${tipo.color} bg-${tipo.color}-light shadow-${tipo.color}`
                : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-light'
            }`}
          >
            <input
              type="radio"
              name="tipo"
              value={tipo.value}
              checked={value === tipo.value}
              onChange={onChange}
              className="sr-only"
            />
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              value === tipo.value ? `bg-${tipo.color} text-white` : 'bg-gray-200 text-gray-600'
            }`}>
              {getTipoIcon(tipo.icon)}
            </div>
            <span className={`text-2sm font-medium transition-colors ${value === tipo.value ? `text-${tipo.color}` : 'text-gray-700'}`}>
              {tipo.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
