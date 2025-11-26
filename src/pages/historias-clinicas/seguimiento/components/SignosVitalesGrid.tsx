// components/SignosVitalesGrid.tsx
import React from 'react';
import { SignoVitalCard } from './SignoVitalCard';
import { SignosVitalesData, EstadisticaSignoVital, IMCData } from '../types';

interface SignosVitalesGridProps {
  signosVitalesData: SignosVitalesData;
  estadisticasPeso: EstadisticaSignoVital | null;
  estadisticasAltura: EstadisticaSignoVital | null;
  estadisticasPresion: EstadisticaSignoVital | null;
  estadisticasFC: EstadisticaSignoVital | null;
  imcData: IMCData | null;
}

export const SignosVitalesGrid: React.FC<SignosVitalesGridProps> = ({
  signosVitalesData,
  estadisticasPeso,
  estadisticasAltura,
  estadisticasPresion,
  estadisticasFC,
  imcData
}) => {
  
  return (
    <div className="space-y-5">
      {/* Título de sección */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Signos Vitales y Antropometría</h2>
          <p className="text-2sm text-gray-600 mt-0.75">Seguimiento de indicadores de salud</p>
        </div>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card: Peso */}
        <SignoVitalCard
          titulo="Peso Corporal"
          icono={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          }
          datos={signosVitalesData.peso}
          estadisticas={estadisticasPeso}
          color="primary"
          unidad="kg"
        />

        {/* Card: Altura */}
        <SignoVitalCard
          titulo="Altura"
          icono={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          }
          datos={signosVitalesData.altura}
          estadisticas={estadisticasAltura}
          color="info"
          unidad="cm"
        />

        {/* Card: Presión Arterial */}
        <SignoVitalCard
          titulo="Presión Arterial"
          icono={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
          datos={signosVitalesData.presionArterial}
          estadisticas={estadisticasPresion}
          color="danger"
          unidad="mmHg"
        />

        {/* Card: Frecuencia Cardíaca */}
        <SignoVitalCard
          titulo="Frecuencia Cardíaca"
          icono={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          datos={signosVitalesData.frecuenciaCardiaca}
          estadisticas={estadisticasFC}
          color="warning"
          unidad="bpm"
        />
      </div>

      {/* Card especial para IMC */}
      {imcData && (
        <div className="card bg-white shadow-card rounded-xl overflow-hidden">
          <div className="px-7.5 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-md font-semibold text-gray-900">Índice de Masa Corporal (IMC)</h3>
                  <p className="text-3xs text-gray-500">Calculado automáticamente</p>
                </div>
              </div>

              {imcData.alerta && (
                <div className="flex items-center gap-1.25 px-2.75 py-1 bg-warning-light text-warning rounded-lg text-3xs font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Revisar
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-6">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2.5xl font-bold text-gray-900">
                    {imcData.valor}
                  </span>
                  <span className="text-md text-gray-600">kg/m²</span>
                </div>
                <span className={`text-md font-medium ${imcData.color} mt-1 block`}>
                  {imcData.categoria}
                </span>
              </div>

              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 w-1/5 bg-info"></div>
                  <div className="absolute inset-y-0 left-1/5 w-1/5 bg-success"></div>
                  <div className="absolute inset-y-0 left-2/5 w-1/5 bg-warning"></div>
                  <div className="absolute inset-y-0 left-3/5 w-2/5 bg-danger"></div>
                  
                  {/* Indicador de posición */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-gray-900 rounded-full"
                    style={{ 
                      left: `${Math.min(Math.max((imcData.valor / 40) * 100, 0), 100)}%`,
                      transform: 'translateX(-50%) translateY(-50%)'
                    }}
                  />
                </div>
                <div className="flex justify-between text-3xs text-gray-500 mt-1.25">
                  <span>&lt;18.5</span>
                  <span>18.5-25</span>
                  <span>25-30</span>
                  <span>&gt;30</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};