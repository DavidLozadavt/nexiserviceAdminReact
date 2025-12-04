import React from 'react';
import { CitaPaciente } from '../types';
import { useListaPacientes } from '../hooks/useListaPacientes';
import { EstadisticasCitas } from './EstadisticasCitas';
import { FiltrosCitas } from './FiltrosCitas';
import { CitaItem } from './CitaItem';

interface ListaPacientesCitasProps {
  medicoId: string;
  onSeleccionarPaciente: (cita: CitaPaciente) => void;
}

export const ListaPacientesCitas: React.FC<ListaPacientesCitasProps> = ({
  medicoId,
  onSeleccionarPaciente
}) => {
  const {
    citas,
    filtro,
    loading,
    setFiltro,
    estadisticas
  } = useListaPacientes(medicoId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-1.5xl font-semibold text-gray-900 mb-1">
          Agenda de Pacientes
        </h2>
        <p className="text-2sm text-gray-600">
          Gestiona tus citas y consulta el historial de tus pacientes
        </p>
      </div>

      <EstadisticasCitas
        total={estadisticas.total}
        pendientes={estadisticas.pendientes}
        enCurso={estadisticas.enCurso}
        completadas={estadisticas.completadas}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-light">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2sm font-semibold text-gray-900">Filtrar por estado</h3>
          <span className="text-2xs text-gray-500 font-medium">{citas.length} citas</span>
        </div>
        <FiltrosCitas
          filtroActual={filtro}
          onFiltroChange={setFiltro}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
        <div className="px-7.5 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h3 className="text-2sm font-semibold text-gray-900">
              Lista de Citas
            </h3>
            <div className="flex items-center gap-2 text-2xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Hoy
            </div>
          </div>
        </div>
        
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : citas.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-2sm text-gray-600 font-medium">No hay citas para mostrar</p>
              <p className="text-2xs text-gray-500 mt-1">Intenta cambiar el filtro de estado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citas.map((cita) => (
                <CitaItem
                  key={cita.id}
                  cita={cita}
                  onClick={() => onSeleccionarPaciente(cita)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};