import React, { useRef } from 'react';
import { cieDiagnosticos } from './autocompleteData';
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
  onExportarTratamiento?: () => void;
  cieCatalogo: Array<{ id: number; codigo: string; descripcion: string }>;
}

// ...existing code...
import { getTipoColor, getTipoIcon } from '../utils';


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
    onExportarTratamiento,
    cieCatalogo,
  } = props;

  // Handler para exportar a PDF
  const handleExportarPDF = () => {
    onExportar();
  };
  // Handler para exportar solo tratamiento
  const handleExportarTratamientoPDF = () => {
    if (onExportarTratamiento) onExportarTratamiento();
  };

  const renderDiagnostico = () => {
    if (Array.isArray(historia.diagnosticos)) {
      return (
        <>
          <div className="mb-2">
            <span className="text-xs bg-info-light text-info px-2 py-0.5 rounded-full">
              {historia.diagnosticos.length} diagnóstico(s)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {historia.diagnosticos.map((diag: any, idx) => {
              // Si el diagnóstico es objeto y tiene cie_id
              if (typeof diag === 'object' && diag !== null && diag.cie_id) {
                const cie = cieCatalogo.find(c => c.id === diag.cie_id);
                return (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 bg-white border border-info-light text-info rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm"
                  >
                    <span className="text-gray-800">{cie ? `${cie.codigo} - ${cie.descripcion}` : diag.cie_id}</span>
                  </span>
                );
              }
              // Si el diagnóstico es solo un id numérico
              if (typeof diag === 'number') {
                return (
                  <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-info-light text-info rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm">
                    <span className="text-gray-800">{diag}</span>
                  </span>
                );
              }
              // Si el diagnóstico es objeto con codigo y descripcion
              if (typeof diag === 'object' && diag !== null && diag.codigo && diag.descripcion) {
                return (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 bg-white border border-info-light text-info rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm"
                  >
                    <span className="text-gray-800">{diag.codigo} - {diag.descripcion}</span>
                  </span>
                );
              }
              // Si es string, buscar por código
              if (typeof diag === 'string') {
                const cie = cieCatalogo.find(c => c.codigo === diag);
                return (
                  <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-info-light text-info rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm">
                    <span className="text-gray-800">{cie ? `${cie.codigo} - ${cie.descripcion}` : diag}</span>
                  </span>
                );
              }
              // Fallback
              return (
                <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-info-light text-info rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm">
                  <span className="text-gray-800">-</span>
                </span>
              );
            })}
          </div>
          </>
      );
    }
    return (
      <p className="text-2sm text-gray-900 bg-info-light p-4 rounded-lg border border-info-clarity">
        {Array.isArray(historia.diagnosticos) && (historia.diagnosticos as any[]).length > 0
          ? (historia.diagnosticos as any[]).map((diag) => {
              if (typeof diag === 'object' && diag !== null && diag.cie_id) {
                const cie = cieCatalogo.find(c => c.id === diag.cie_id);
                return cie ? `${cie.codigo} - ${cie.descripcion}` : diag.cie_id;
              }
              if (typeof diag === 'number') {
                const cie = cieCatalogo.find(c => c.id === diag);
                return cie ? `${cie.codigo} - ${cie.descripcion}` : diag;
              }
              if (typeof diag === 'object' && diag !== null && diag.codigo && diag.descripcion) {
                return `${diag.codigo} - ${diag.descripcion}`;
              }
              if (typeof diag === 'string') {
                const cie = cieCatalogo.find(c => c.codigo === diag);
                return cie ? `${cie.codigo} - ${cie.descripcion}` : diag;
              }
              return '-';
            }).join(', ')
          : String(historia.diagnosticos)}
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
            {/* Mover el menú de acciones aquí, fuera del map */}
            <MenuAcciones
              historiaId={historia.id}
              onEditar={onEditar}
              onAdjuntar={onAdjuntar}
              onRegistrarEvolucion={onRegistrarEvolucion}
              onExportar={handleExportarPDF}
              onExportarTratamiento={handleExportarTratamientoPDF}
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
              {Array.isArray(historia.diagnosticos) && (
                  <span className="ml-auto text-xs bg-info-light text-info px-2 py-0.5 rounded-full">
                    {historia.diagnosticos.length}
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