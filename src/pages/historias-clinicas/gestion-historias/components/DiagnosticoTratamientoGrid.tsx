import React, { useState } from 'react';

interface DiagnosticoTratamientoGridProps {
  diagnostico: string;
  tratamiento: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}
export const DiagnosticoTratamientoGrid: React.FC<DiagnosticoTratamientoGridProps> = ({
  diagnostico,
  tratamiento,
  onChange
}) => {
  const [suggestion, setSuggestion] = useState<{codigo: string, nombre: string, index: number} | null>(null);

  // Handler especial para diagnóstico: detecta códigos CIE y sugiere añadir el nombre
  const handleDiagnosticoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    let found = null;
    cieList.forEach(cie => {
      // Regex para encontrar el código como palabra completa
      const regex = new RegExp(`\\b${cie.codigo.replace('.', '\\.')}(?! - )\\b`, 'i');
      const match = value.match(regex);
      if (match) {
        found = { codigo: cie.codigo, nombre: cie.nombre, index: match.index ?? -1 };
      }
    });
    setSuggestion(found);
    onChange(e);
  };

  // Añadir el nombre del diagnóstico después del código detectado
  const handleAddSuggestion = () => {
    if (!suggestion) return;
    const { codigo, nombre, index } = suggestion;
    // Insertar solo el nombre justo después del código, eliminando el código
    const before = diagnostico.slice(0, index!);
    const after = diagnostico.slice(index! + codigo.length);
    const newValue = `${before}${nombre}${after}`;
    // Crear un evento sintético para actualizar el valor
    const syntheticEvent = {
      target: {
        name: 'diagnostico',
        value: newValue
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    setSuggestion(null);
    onChange(syntheticEvent);
  };
  // Lista de CIE
  const cieList = [
    { codigo: 'J06.9', nombre: 'Infección aguda de las vías respiratorias superiores, no especificada' },
    { codigo: 'E11', nombre: 'Diabetes mellitus tipo 2' },
    { codigo: 'I10', nombre: 'Hipertensión esencial (primaria)' },
    { codigo: 'J45', nombre: 'Asma' },
    { codigo: 'M54.5', nombre: 'Lumbalgia' },
    { codigo: 'F32.0', nombre: 'Episodio depresivo leve' },
    { codigo: 'N39.0', nombre: 'Infección urinaria, sitio no especificado' },
    { codigo: 'A09', nombre: 'Diarrea y gastroenteritis de presunto origen infeccioso' },
    { codigo: 'J18.9', nombre: 'Neumonía, no especificada' },
    { codigo: 'K21.0', nombre: 'Enfermedad por reflujo gastroesofágico con esofagitis' },
    { codigo: 'E78.5', nombre: 'Hiperlipidemia, no especificada' },
    { codigo: 'F41.1', nombre: 'Trastorno de ansiedad generalizada' },
    { codigo: 'M79.1', nombre: 'Mialgia' },
    { codigo: 'J00', nombre: 'Nasofaringitis aguda (resfriado común)' },
    { codigo: 'R51', nombre: 'Cefalea' },
    { codigo: 'K52.9', nombre: 'Gastroenteritis y colitis no infecciosa, no especificada' },
    { codigo: 'L30.9', nombre: 'Dermatitis, no especificada' },
    { codigo: 'H10.9', nombre: 'Conjuntivitis, no especificada' },
    { codigo: 'B34.9', nombre: 'Infección viral, no especificada' },
    { codigo: 'R05', nombre: 'Tos' },
  ];

  // Buscar si el input es un código CIE válido
  const cieMatch = cieList.find(cie => diagnostico.trim().toUpperCase() === cie.codigo.toUpperCase());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-gradient-to-br from-danger-light via-white to-white rounded-xl p-5 border border-danger-clarity shadow-light">
  <label className="flex text-2sm font-semibold text-gray-900 mb-2.5 items-center gap-2">
          <div className="w-8 h-8 bg-danger-light rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          Diagnóstico <span className="text-danger">*</span>
        </label>
        <textarea
          name="diagnostico"
          value={diagnostico}
          onChange={handleDiagnosticoChange as any}
          placeholder="Diagnóstico médico principal o código CIE..."
          className="input input-lg w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-danger focus:ring-4 focus:ring-danger-clarity transition-all duration-200 min-h-28 resize-none text-2sm placeholder:text-gray-400 bg-white"
          rows={4}
          required
        />
        {suggestion && (
          <div className="mt-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2 cursor-pointer hover:bg-blue-100" onClick={handleAddSuggestion}>
            Añadir: <span className="font-semibold">{suggestion.nombre}</span> después de <span className="font-mono">{suggestion.codigo}</span>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-success-light via-white to-white rounded-xl p-5 border border-success-clarity shadow-light">
  <label className="flex text-2sm font-semibold text-gray-900 mb-2.5 items-center gap-2">
          <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          Tratamiento <span className="text-danger">*</span>
        </label>
        <textarea
          name="tratamiento"
          value={tratamiento}
          onChange={onChange}
          placeholder="Plan de tratamiento y medicamentos..."
          className="input input-lg w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-success focus:ring-4 focus:ring-success-clarity transition-all duration-200 min-h-28 resize-none text-2sm placeholder:text-gray-400 bg-white"
          rows={4}
          required
        />
      </div>
    </div>
  );
};