import React from 'react';

interface BusquedaPacienteProps {
  identificacion: string;
  onIdentificacionChange: (value: string) => void;
  onBuscar: () => void;
}

export const BusquedaPaciente: React.FC<BusquedaPacienteProps> = ({
  identificacion,
  onIdentificacionChange,
  onBuscar
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onBuscar();
    }
  };

  return (
    <div className="card bg-white shadow-card border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-7.5 py-6 border-b border-gray-200">
        <h2 className="text-1.5xl font-semibold text-gray-800 mb-4">
          Buscar Paciente
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-2sm font-medium text-gray-700 mb-2">
              Número de identificación
            </label>
            <input
              type="text"
              className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200"
              placeholder="Ingresa el número de identificación"
              value={identificacion}
              onChange={e => onIdentificacionChange(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="sm:self-end">
            <button
              className="btn btn-lg bg-primary hover:bg-primary-active text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-primary w-full sm:w-auto flex items-center justify-center"
              onClick={onBuscar}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};