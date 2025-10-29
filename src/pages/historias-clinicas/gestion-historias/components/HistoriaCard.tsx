import React from 'react';
import { HistoriaClinica } from '../types';
import { AdjuntosSection } from './AdjuntosSection';
import { EvolucionesSection } from './EvolucionesSection';
import { HistorialCambios } from './HistorialCambios';
import { AntecedentesDisplay } from './AntecedentesDisplay';
import MenuAcciones from './MenuAcciones';

interface HistoriaCardProps {
  historia: HistoriaClinica;
  numeroHistoria: string;
  onEditar: () => void;
  onAdjuntar: (file: File) => void;
  onRegistrarEvolucion: () => void;
  mostrandoFormEvolucion: boolean;
  formEvolucionComponent: React.ReactNode;
  historialExpandido: boolean;
  onToggleHistorial: () => void;
}

export const HistoriaCard: React.FC<HistoriaCardProps> = ({
  historia,
  numeroHistoria,
  onEditar,
  onAdjuntar,
  onRegistrarEvolucion,
  mostrandoFormEvolucion,
  formEvolucionComponent,
  historialExpandido,
  onToggleHistorial
}) => {
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'medica':
        return 'bg-primary-light text-primary border-primary';
      case 'fisioterapia':
        return 'bg-info-light text-info border-info';
      case 'odontologica':
        return 'bg-warning-light text-warning border-warning';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'medica':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'fisioterapia':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'odontologica':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 015 0H17" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card bg-white shadow-card border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-7.5 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-3xs font-medium border ${getTipoColor(historia.tipo)}`}>
              {getTipoIcon(historia.tipo)}
              <span className="ml-1.5 capitalize">{historia.tipo}</span>
            </div>
            <div>
              <h3 className="text-1.5xl font-semibold text-gray-900">
                Historia Clínica #{numeroHistoria}
              </h3>
              {historia.historialCambios && historia.historialCambios.length > 0 && (
                <div className="text-2sm text-gray-600 mt-0.5">
                  Creada el {historia.historialCambios[0].fecha} por{' '}
                  <span className="font-semibold">{historia.historialCambios[0].usuario}</span>
                </div>
              )}
            </div>
          </div>
          <MenuAcciones
            historiaId={historia.id}
            onEditar={onEditar}
            onAdjuntar={onAdjuntar}
            onRegistrarEvolucion={onRegistrarEvolucion}
          />
        </div>
      </div>
      
      <div className="px-7.5 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <h4 className="text-2sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Motivo de Consulta
            </h4>
            <p className="text-2sm text-gray-900 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {historia.motivoConsulta}
            </p>
          </div>

          <div>
            <h4 className="text-2sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-info rounded-full"></span>
              Enfermedad Actual
            </h4>
            <p className="text-2sm text-gray-900 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {historia.enfermedadActual || 'No especificada'}
            </p>
          </div>

          <div>
            <h4 className="text-2sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-success rounded-full"></span>
              Examen Físico
            </h4>
            <p className="text-2sm text-gray-900 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {historia.examenFisico}
            </p>
          </div>

          <div>
            <h4 className="text-2sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-danger rounded-full"></span>
              Diagnóstico
            </h4>
            <p className="text-2sm text-gray-900 bg-danger-light p-4 rounded-lg border border-danger-clarity">
              {historia.diagnostico}
            </p>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-2sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-success rounded-full"></span>
              Tratamiento
            </h4>
            <p className="text-2sm text-gray-900 bg-success-light p-4 rounded-lg border border-success-clarity">
              {historia.tratamiento}
            </p>
          </div>

          {historia.observaciones && (
            <div className="lg:col-span-2">
              <h4 className="text-2sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-warning rounded-full"></span>
                Observaciones
              </h4>
              <p className="text-2sm text-gray-900 bg-warning-light p-4 rounded-lg border border-warning-clarity">
                {historia.observaciones}
              </p>
            </div>
          )}
        </div>

        <AntecedentesDisplay antecedentes={historia.antecedentes} />

        {mostrandoFormEvolucion && formEvolucionComponent}

        <EvolucionesSection evoluciones={historia.evoluciones} />

        <AdjuntosSection adjuntos={historia.adjuntos} />

        <HistorialCambios
          cambios={historia.historialCambios}
          expandido={historialExpandido}
          onToggle={onToggleHistorial}
        />
      </div>
    </div>
  );
};