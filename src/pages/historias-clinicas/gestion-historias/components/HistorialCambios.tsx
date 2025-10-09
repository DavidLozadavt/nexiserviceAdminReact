import React from 'react';

interface Cambio {
  fecha: string;
  usuario: string;
  motivo: string;
}

interface HistorialCambiosProps {
  cambios?: Cambio[];
  expandido: boolean;
  onToggle: () => void;
}

export const HistorialCambios: React.FC<HistorialCambiosProps> = ({ 
  cambios, 
  expandido, 
  onToggle 
}) => {
  if (!cambios || cambios.length <= 1) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
      >
        <h4 className="text-2sm font-semibold text-gray-900 flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Historial de Cambios
          <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-3xs font-medium rounded-full">
            {cambios.length - 1}
          </span>
        </h4>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {expandido && (
        <div className="mt-3 space-y-3 pl-3">
          {cambios.slice(1).map((cambio, idx) => (
            <div key={idx} className="flex items-start">
              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3"></div>
              <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                <p className="text-2sm text-gray-900 font-medium">{cambio.motivo}</p>
                <div className="flex items-center mt-1 text-3xs text-gray-600">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {cambio.fecha}
                  <span className="mx-2">•</span>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold">{cambio.usuario}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
