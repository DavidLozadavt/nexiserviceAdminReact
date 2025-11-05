import React, { useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';

interface AntecedentesSectionProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

const antecedentesOptions: Record<string, string[]> = {
  Patológicos: ['Enfermedades previas', 'Hospitalizaciones', 'Cirugías'],
  Familiares: ['Enfermedades hereditarias'],
  Alergias: ['Medicamentos', 'Alimentos', 'Sustancias'],
  'Tóxicos y Farmacológicos': ['Consumo de tabaco', 'Consumo de alcohol', 'Consumo de drogas', 'Medicamentos habituales'],
};

export const AntecedentesSection: React.FC<AntecedentesSectionProps> = ({
  form,
  setForm,
  isExpanded,
  setIsExpanded
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsExpanded(false));

  return (
    <div ref={ref} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left mb-4 group"
      >
        <h3 className="text-2sm font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          Antecedentes <span className="text-danger">*</span>
        </h3>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="space-y-4">
          {Object.entries(antecedentesOptions).map(([label, options]) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-light">
              <h4 className="text-2sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                {label}
              </h4>
              <div className="space-y-3">
                {options.map((option) => (
                  <div key={option} className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-2sm text-gray-700 min-w-48 font-medium">{option}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer group/radio">
                          <input
                            type="radio"
                            name={`${label}-${option}-check`}
                            value="si"
                            checked={form[`${label}-${option}-check`] === 'si'}
                            onChange={(e) =>
                              setForm((prev: any) => ({
                                ...prev,
                                [`${label}-${option}-check`]: e.target.value,
                              }))
                            }
                            className="radio radio-sm text-success border-gray-300 focus:ring-2 focus:ring-success-clarity"
                          />
                          <span className="text-2sm text-gray-700 group-hover/radio:text-success transition-colors">Sí</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group/radio">
                          <input
                            type="radio"
                            name={`${label}-${option}-check`}
                            value="no"
                            checked={form[`${label}-${option}-check`] === 'no'}
                            onChange={(e) =>
                              setForm((prev: any) => ({
                                ...prev,
                                [`${label}-${option}-check`]: e.target.value,
                              }))
                            }
                            className="radio radio-sm text-danger border-gray-300 focus:ring-2 focus:ring-danger-clarity"
                          />
                          <span className="text-2sm text-gray-700 group-hover/radio:text-danger transition-colors">No</span>
                        </label>
                      </div>
                    </div>
                    {form[`${label}-${option}-check`] === 'si' && (
                      <textarea
                        name={`${label}-${option}-description`}
                        value={form[`${label}-${option}-description`] || ''}
                        onChange={(e) =>
                          setForm((prev: any) => ({
                            ...prev,
                            [`${label}-${option}-description`]: e.target.value,
                          }))
                        }
                        placeholder={`Describe detalles sobre ${option.toLowerCase()}...`}
                        className="input input-lg w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 focus:border-primary focus:ring-4 focus:ring-primary-clarity transition-all duration-200 min-h-20 resize-none text-2sm placeholder:text-gray-400"
                        rows={2}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-light">
            <h4 className="text-2sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              Vacunación
            </h4>
            <div className="flex items-center gap-3 mb-3">
              <label className="flex items-center gap-1.5 cursor-pointer group/radio">
                <input
                  type="radio"
                  name="Vacunación-check"
                  value="si"
                  checked={form['Vacunación-check'] === 'si'}
                  onChange={(e) =>
                    setForm((prev: any) => ({
                      ...prev,
                      'Vacunación-check': e.target.value,
                    }))
                  }
                  className="radio radio-sm text-success border-gray-300 focus:ring-2 focus:ring-success-clarity"
                />
                <span className="text-2sm text-gray-700 group-hover/radio:text-success transition-colors">Sí</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer group/radio">
                <input
                  type="radio"
                  name="Vacunación-check"
                  value="no"
                  checked={form['Vacunación-check'] === 'no'}
                  onChange={(e) =>
                    setForm((prev: any) => ({
                      ...prev,
                      'Vacunación-check': e.target.value,
                    }))
                  }
                  className="radio radio-sm text-danger border-gray-300 focus:ring-2 focus:ring-danger-clarity"
                />
                <span className="text-2sm text-gray-700 group-hover/radio:text-danger transition-colors">No</span>
              </label>
            </div>
            {form['Vacunación-check'] === 'si' && (
              <textarea
                name="Vacunación-description"
                value={form['Vacunación-description'] || ''}
                onChange={(e) =>
                  setForm((prev: any) => ({
                    ...prev,
                    'Vacunación-description': e.target.value,
                  }))
                }
                placeholder="Describe detalles sobre vacunación..."
                className="input input-lg w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 focus:border-primary focus:ring-4 focus:ring-primary-clarity transition-all duration-200 min-h-20 resize-none text-2sm placeholder:text-gray-400"
                rows={2}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};