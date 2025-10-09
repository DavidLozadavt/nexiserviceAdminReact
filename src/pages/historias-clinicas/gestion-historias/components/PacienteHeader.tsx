import React from 'react';
import { Paciente } from '../../gestion-pacientes/types';

interface PacienteHeaderProps {
  paciente: Paciente;
  onClose?: () => void;
  onNuevaHistoria: () => void;
  showForm: boolean;
}

export const PacienteHeader: React.FC<PacienteHeaderProps> = ({ 
  paciente, 
  onClose, 
  onNuevaHistoria,
  showForm 
}) => {
  return (
    <div className="card bg-white shadow-card border border-gray-200 rounded-xl mb-8 overflow-hidden">
      <div className="px-7.5 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2.5xl font-bold text-gray-900 mb-1">
                {paciente.nombreCompleto}
              </h1>
              <div className="flex items-center text-md text-gray-600">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 118 0v2m-4 0a2 2 0 104 0m-4 0a2 2 0 014 0z" />
                </svg>
                {paciente.tipoIdentificacion} {paciente.identificacion}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onClose && (
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
                title="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {!showForm && (
              <button
                className="btn btn-lg bg-primary hover:bg-primary-active text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-primary"
                onClick={onNuevaHistoria}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Historia
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};