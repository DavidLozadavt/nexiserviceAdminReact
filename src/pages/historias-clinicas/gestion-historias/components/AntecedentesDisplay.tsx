import React, { useState } from 'react';
import { Antecedentes, AntecedenteItem } from '../types';

interface AntecedentesDisplayProps {
  antecedentes: Antecedentes;
}

export const AntecedentesDisplay: React.FC<AntecedentesDisplayProps> = ({ antecedentes }) => {
  const [expandido, setExpandido] = useState(false);

  const renderAntecedenteItem = (label: string, item?: AntecedenteItem) => {
    if (!item) return null;
    
    return (
      <div className="flex items-start gap-2 text-2sm">
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
          <span className="font-medium text-gray-700">{label}:</span>
          {item.tiene && item.descripcion ? (
            <p className="text-gray-600 mt-1">{item.descripcion}</p>
          ) : (
            <span className="text-gray-500 ml-1">No registrado</span>
          )}
        </div>
      </div>
    );
  };

  const tieneAntecedentes = () => {
    const { patologicos, familiares, alergias, toxicosFarmacologicos, vacunacion } = antecedentes;
    
    return (
      (patologicos.enfermedadesPrevias?.tiene) ||
      (patologicos.hospitalizaciones?.tiene) ||
      (patologicos.cirugias?.tiene) ||
      (familiares.enfermedadesHereditarias?.tiene) ||
      (alergias.medicamentos?.tiene) ||
      (alergias.alimentos?.tiene) ||
      (alergias.sustancias?.tiene) ||
      (toxicosFarmacologicos.consumoTabaco?.tiene) ||
      (toxicosFarmacologicos.consumoAlcohol?.tiene) ||
      (toxicosFarmacologicos.consumoDrogas?.tiene) ||
      (toxicosFarmacologicos.medicamentosHabituales?.tiene) ||
      (vacunacion?.tiene)
    );
  };

  if (!tieneAntecedentes()) {
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
          {(antecedentes.patologicos.enfermedadesPrevias || 
            antecedentes.patologicos.hospitalizaciones || 
            antecedentes.patologicos.cirugias) && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-light">
              <h5 className="text-2sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Antecedentes Patológicos
              </h5>
              <div className="space-y-3">
                {renderAntecedenteItem('Enfermedades previas', antecedentes.patologicos.enfermedadesPrevias)}
                {renderAntecedenteItem('Hospitalizaciones', antecedentes.patologicos.hospitalizaciones)}
                {renderAntecedenteItem('Cirugías', antecedentes.patologicos.cirugias)}
              </div>
            </div>
          )}

          {antecedentes.familiares.enfermedadesHereditarias && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-light">
              <h5 className="text-2sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Antecedentes Familiares
              </h5>
              <div className="space-y-3">
                {renderAntecedenteItem('Enfermedades hereditarias', antecedentes.familiares.enfermedadesHereditarias)}
              </div>
            </div>
          )}

          {(antecedentes.alergias.medicamentos || 
            antecedentes.alergias.alimentos || 
            antecedentes.alergias.sustancias) && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-light">
              <h5 className="text-2sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-danger rounded-full"></span>
                Alergias
              </h5>
              <div className="space-y-3">
                {renderAntecedenteItem('Medicamentos', antecedentes.alergias.medicamentos)}
                {renderAntecedenteItem('Alimentos', antecedentes.alergias.alimentos)}
                {renderAntecedenteItem('Sustancias', antecedentes.alergias.sustancias)}
              </div>
            </div>
          )}

          {(antecedentes.toxicosFarmacologicos.consumoTabaco || 
            antecedentes.toxicosFarmacologicos.consumoAlcohol || 
            antecedentes.toxicosFarmacologicos.consumoDrogas || 
            antecedentes.toxicosFarmacologicos.medicamentosHabituales) && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-light">
              <h5 className="text-2sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-warning rounded-full"></span>
                Hábitos Tóxicos y Farmacológicos
              </h5>
              <div className="space-y-3">
                {renderAntecedenteItem('Consumo de tabaco', antecedentes.toxicosFarmacologicos.consumoTabaco)}
                {renderAntecedenteItem('Consumo de alcohol', antecedentes.toxicosFarmacologicos.consumoAlcohol)}
                {renderAntecedenteItem('Consumo de drogas', antecedentes.toxicosFarmacologicos.consumoDrogas)}
                {renderAntecedenteItem('Medicamentos habituales', antecedentes.toxicosFarmacologicos.medicamentosHabituales)}
              </div>
            </div>
          )}

          {antecedentes.vacunacion && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-light">
              <h5 className="text-2sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                Vacunación
              </h5>
              <div className="space-y-3">
                {renderAntecedenteItem('Estado de vacunación', antecedentes.vacunacion)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};