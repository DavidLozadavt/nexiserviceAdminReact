import React, { useState } from 'react';
import { Antecedentes, AntecedenteItem } from '../types';

interface AntecedentesDisplayProps {
  antecedentes?: Antecedentes;
}

const grupos = [
  {
    label: 'Antecedentes Patológicos',
    subcategorias: ['Enfermedades previas', 'Hospitalizaciones', 'Cirugías']
  },
  {
    label: 'Antecedentes Familiares',
    subcategorias: ['Enfermedades hereditarias']
  },
  {
    label: 'Alergias',
    subcategorias: ['Medicamentos', 'Alimentos', 'Sustancias']
  },
  {
    label: 'Hábitos Tóxicos y Farmacológicos',
    subcategorias: ['Consumo de tabaco', 'Consumo de alcohol', 'Consumo de drogas', 'Medicamentos habituales']
  },
  {
    label: 'Vacunación',
    subcategorias: ['Vacunación']
  }
];

export const AntecedentesDisplay: React.FC<AntecedentesDisplayProps> = ({ antecedentes }) => {
  const [expandido, setExpandido] = useState(false);
  const antecedentesArray: AntecedenteItem[] = Array.isArray(antecedentes) ? antecedentes : [];

  const renderGrupo = (grupo: typeof grupos[0]) => {
    const items = grupo.subcategorias
      .map(subcat => antecedentesArray.find(a => a.subcategoria === subcat))
      .filter((a): a is AntecedenteItem => !!a);
    if (items.length === 0) return null;
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-light">
        <h5 className="text-2sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
          {grupo.label}
        </h5>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.subcategoria + '-' + (item.descripcion?.slice(0,10) || '')} className="flex items-start gap-2 text-2sm">
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 mt-0.5 ${
                item.tiene ? 'bg-success-light text-success' : 'bg-gray-200 text-gray-600'
              }`}>
                {item.tiene ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </span>
              <div className="flex-1">
                <span className="font-medium text-gray-700">{item.subcategoria}:</span>
                <p className="text-gray-600 mt-1">{item.descripcion || 'No registrado'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const tieneAntecedentes = antecedentesArray.length > 0 && antecedentesArray.some(a => a.tiene);

  if (!tieneAntecedentes) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-2sm text-gray-600 text-center">Sin antecedentes registrados</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
      <button
        type="button"
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between text-left mb-4 group"
      >
        <h4 className="text-2sm font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          Antecedentes Médicos
        </h4>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expandido && (
        <div className="space-y-5">
          {grupos.map(grupo => renderGrupo(grupo))}
        </div>
      )}
    </div>
  );
}
