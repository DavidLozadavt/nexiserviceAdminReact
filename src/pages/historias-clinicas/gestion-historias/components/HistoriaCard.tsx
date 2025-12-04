import React, { useRef } from 'react';
import { HistoriaClinica } from '../types';
import { AdjuntosSection } from './AdjuntosSection';
import { EvolucionesSection } from './EvolucionesSection';
import { HistorialCambios } from './HistorialCambios';
import { AntecedentesDisplay } from './AntecedentesDisplay';
import MenuAcciones from './MenuAcciones';
import { exportarHistoriaPDF } from '../utils/exportarHistoriaPDF';
import { MarcaOcularPage } from '../../marca-ocular/marca-ocular';

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
  onExportar: () => void;
}

export const getTipoColor = (tipo: string) => {
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

export const getTipoIcon = (tipo: string) => {
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
}


export const HistoriaCard: React.FC<HistoriaCardProps> = (props) => {
  const {
    historia,
    numeroHistoria,
    onEditar,
    onAdjuntar,
    onRegistrarEvolucion,
    mostrandoFormEvolucion,
    formEvolucionComponent,
    historialExpandido,
    onToggleHistorial,
    onExportar,
  } = props;

  // Ref para el contenedor de la historia
  // Handler para exportar a PDF
  const handleExportarPDF = () => {
    onExportar();
  };

  const renderDiagnostico = () => {
    if (Array.isArray(historia.diagnostico)) {
      return (
        <div className="flex flex-wrap gap-2">
          {historia.diagnostico.map((diag, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center gap-1.5 bg-white border border-info-light text-info rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-3.5 w-3.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-gray-800">{diag}</span>
            </span>
          ))}
        </div>
      );
    }
    return (
      <p className="text-2sm text-gray-900 bg-info-light p-4 rounded-lg border border-info-clarity">
        {historia.diagnostico}
      </p>
    );
  };

  const renderTratamiento = () => {
    if (Array.isArray(historia.tratamiento) && historia.tratamiento.length > 0) {
      return (
        <div className="flex flex-col gap-2">
          {historia.tratamiento.map((trat, idx) => (
            <div
              key={idx}
              className="bg-white border border-success-light text-success rounded-lg px-3 py-2 text-xs font-medium shadow-sm flex flex-col md:flex-row md:items-center gap-1"
            >
              <span><b>Medicamento:</b> {trat.medicamento}</span>
              {trat.presentacion && <span><b>Presentación:</b> {trat.presentacion}</span>}
              <span><b>Dosis:</b> {trat.dosis}</span>
              <span><b>¿Cómo tomar?:</b> {trat.como_tomar}</span>
            </div>
          ))}
        </div>
      );
    }
    return (
      <p className="text-2sm text-gray-900 bg-success-light p-4 rounded-lg border border-success-clarity">
        No hay tratamientos registrados.
      </p>
    );
  };

  return (
    <div className="card bg-white shadow-card border border-gray-200 rounded-xl overflow-hidden">
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
            onExportar={handleExportarPDF}
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
              {historia.enfermedad_actual || 'No especificada'}
            </p>
          </div>

          <div>
            <h4 className="text-2sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-success rounded-full"></span>
              Examen Físico
            </h4>
            <div className="text-2sm text-gray-900 bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-1">
              <div><span className="font-semibold">Peso:</span> {historia.examenFisico?.peso || '—'} kg</div>
              <div><span className="font-semibold">Altura:</span> {historia.examenFisico?.altura || '—'} cm</div>
              <div><span className="font-semibold">Presión arterial:</span> {historia.examenFisico?.presionArterial || '—'}</div>
              <div><span className="font-semibold">Frecuencia cardíaca:</span> {historia.examenFisico?.frecuenciaCardiaca || '—'} lpm</div>
            </div>
          </div>

          <div>
            <h4 className="text-2sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-info rounded-full"></span>
              Diagnóstico
              {Array.isArray(historia.diagnostico) && (
                <span className="ml-auto text-xs bg-info-light text-info px-2 py-0.5 rounded-full">
                  {historia.diagnostico.length}
                </span>
              )}
            </h4>
            <div className="bg-info-light/30 p-4 rounded-lg border border-info-clarity">
              {renderDiagnostico()}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-2sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-success rounded-full"></span>
              Tratamiento
              {Array.isArray(historia.tratamiento) && (
                <span className="ml-auto text-xs bg-success-light text-success px-2 py-0.5 rounded-full">
                  {historia.tratamiento.length}
                </span>
              )}
            </h4>
            <div className="bg-success-light/30 p-4 rounded-lg border border-success-clarity">
              {renderTratamiento()}
            </div>
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
        <MarcaOcularPage></MarcaOcularPage>
      </div>

      
    </div>
  );
};