// SeguimientoPaciente.tsx
import React from 'react';
import { SignosVitalesGrid } from './components/SignosVitalesGrid';
import { useSignosVitales } from './hooks/useSignosVitales';
import { useCalculoIMC } from './hooks/useCalculoIMC';
import { HistoriaClinicaSignos } from './types';

interface Paciente {
  id: string;
  nombreCompleto: string;
  tipoIdentificacion: string;
  identificacion: string;
}

interface SeguimientoPacienteProps {
  paciente: Paciente;
  historias: HistoriaClinicaSignos[];
  onClose?: () => void;
}

export const SeguimientoPaciente: React.FC<SeguimientoPacienteProps> = ({
  paciente,
  historias,
  onClose
}) => {
  
  const {
    signosVitalesData,
    estadisticasPeso,
    estadisticasAltura,
    estadisticasPresion,
    estadisticasFC,
    tieneDatos
  } = useSignosVitales(historias);

  // Hook para calcular IMC
  const imcData = useCalculoIMC(
    signosVitalesData.peso,
    signosVitalesData.altura
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header del Paciente */}
        <div className="card bg-white shadow-card rounded-xl mb-7.5 overflow-hidden">
          <div className="px-7.5 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Seguimiento de {paciente.nombreCompleto}
                  </h1>
                  <div className="flex items-center gap-3 text-2sm text-gray-600 mt-0.75">
                    <span className="flex items-center gap-1.25">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 118 0v2m-4 0a2 2 0 104 0m-4 0a2 2 0 014 0z" />
                      </svg>
                      {paciente.tipoIdentificacion} {paciente.identificacion}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1.25">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {historias.length} historias clínicas
                    </span>
                  </div>
                </div>
              </div>

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
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        {tieneDatos ? (
          <SignosVitalesGrid
            signosVitalesData={signosVitalesData}
            estadisticasPeso={estadisticasPeso}
            estadisticasAltura={estadisticasAltura}
            estadisticasPresion={estadisticasPresion}
            estadisticasFC={estadisticasFC}
            imcData={imcData}
          />
        ) : (
          <div className="card bg-white shadow-card rounded-xl">
            <div className="px-7.5 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sin datos de seguimiento
              </h3>
              <p className="text-2sm text-gray-600 mb-6 max-w-md mx-auto">
                Este paciente no tiene signos vitales registrados en sus historias clínicas. 
                Crea o edita una historia clínica para agregar datos de peso, altura, presión arterial y frecuencia cardíaca.
              </p>
            </div>
          </div>
        )}

        {/* Información adicional */}
        {tieneDatos && (
          <div className="mt-5 card bg-info-light border border-info-clarity rounded-xl overflow-hidden">
            <div className="px-7.5 py-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-info flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-2sm font-semibold text-info mb-1">
                  Información sobre el seguimiento
                </h4>
                <p className="text-2sm text-gray-700">
                  Los signos vitales se extraen automáticamente de las historias clínicas registradas. 
                  Las gráficas muestran la evolución temporal y las alertas se generan cuando los valores 
                  están fuera de los rangos normales establecidos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};