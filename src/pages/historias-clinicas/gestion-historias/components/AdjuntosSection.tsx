import React from 'react';

interface Adjunto {
  id: string;
  nombre: string;
  url: string;
  tipo: string;
}

interface AdjuntosSectionProps {
  adjuntos?: Adjunto[];
}

export const AdjuntosSection: React.FC<AdjuntosSectionProps> = ({ adjuntos }) => {
  if (!adjuntos || adjuntos.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h4 className="text-2sm font-semibold text-gray-900 mb-3 flex items-center">
        <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
        Archivos Adjuntos
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {adjuntos.map(a => (
          <a 
            key={a.id}
            href={a.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
          >
            <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-clarity transition-colors">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2sm font-medium text-gray-900 truncate">{a.nombre}</p>
              <p className="text-3xs text-gray-500">{a.tipo || 'Archivo'}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
};
