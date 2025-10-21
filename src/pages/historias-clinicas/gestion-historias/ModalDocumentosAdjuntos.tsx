import React from 'react';
import { Paciente } from '../gestion-pacientes/types';
import { HistoriaClinica } from '../gestion-historias/types';

interface ModalDocumentosAdjuntosProps {
  paciente: Paciente;
  historias: HistoriaClinica[];
  onClose: () => void;
}

export const ModalDocumentosAdjuntos: React.FC<ModalDocumentosAdjuntosProps> = ({ paciente, historias, onClose }) => {
  // Filtrar archivos permitidos (PDF, imágenes, DICOM)
  const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/dicom'];
  const historiasConAdjuntos = historias.filter(h => h.adjuntos && h.adjuntos.length > 0);

  // Filtrar adjuntos por tipo permitido
  historiasConAdjuntos.forEach(historia => {
    historia.adjuntos = historia.adjuntos.filter(adjunto => tiposPermitidos.includes(adjunto.tipo));
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ minWidth: 600, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div className="flex items-center justify-between px-7.5 py-6 border-b border-gray-200">
          <div>
            <h2 className="text-1.5xl font-bold text-gray-900 mb-1">Archivos adjuntos de {paciente.nombre1 + paciente.apellido1}</h2>
            <div className="text-md text-gray-600">CC {paciente.identificacion}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200" title="Cerrar">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-7.5 py-6">
          {historiasConAdjuntos.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-1.5xl font-semibold mb-2">No hay archivos adjuntos</div>
              <div className="text-2sm">Ninguna historia clínica de este paciente tiene archivos adjuntos.</div>
            </div>
          ) : (
            <div className="space-y-8">
              {historiasConAdjuntos.map((historia, idx) => (
                <div key={historia.id} className="">
                  <div className="mb-2 text-lg font-semibold text-primary">Historia #{(idx+1).toString().padStart(2,'0')}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {historia.adjuntos?.map(adjunto => (
                      <a key={adjunto.id} href={adjunto.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 group">
                        <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-clarity transition-colors">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-2sm font-medium text-gray-900 truncate">{adjunto.nombre}</p>
                          <p className="text-3xs text-gray-500">{adjunto.tipo || 'Archivo'}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
