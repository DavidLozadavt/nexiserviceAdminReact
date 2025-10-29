import React from 'react';
import { CitaPaciente } from '../types';

interface CitaItemProps {
  cita: CitaPaciente;
  onClick: () => void;
}

export const CitaItem: React.FC<CitaItemProps> = ({ cita, onClick }) => {
  const getTipoCitaColor = (tipo: CitaPaciente['tipoCita']) => {
    switch (tipo) {
      case 'primera_vez':
        return 'bg-primary-light text-primary border-primary-clarity';
      case 'control':
        return 'bg-success-light text-success border-success-clarity';
      case 'urgencia':
        return 'bg-danger-light text-danger border-danger-clarity';
      case 'seguimiento':
        return 'bg-info-light text-info border-info-clarity';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getEstadoBadge = (estado: CitaPaciente['estado']) => {
    switch (estado) {
      case 'pendiente':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-warning-light rounded-lg border border-warning-clarity">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-2xs font-semibold text-warning">Pendiente</span>
          </div>
        );
      case 'en_curso':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-info-light rounded-lg border border-info-clarity">
            <div className="w-2 h-2 bg-info rounded-full animate-pulse"></div>
            <span className="text-2xs font-semibold text-info">En Curso</span>
          </div>
        );
      case 'completada':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-light rounded-lg border border-success-clarity">
            <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-2xs font-semibold text-success">Completada</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getTipoCitaLabel = (tipo: CitaPaciente['tipoCita']) => {
    const labels = {
      primera_vez: 'Primera Vez',
      control: 'Control',
      urgencia: 'Urgencia',
      seguimiento: 'Seguimiento'
    };
    return labels[tipo];
  };

  return (
    <button
      onClick={() => {
        console.log('Cita seleccionada:', cita.pacienteId);
        onClick();
      }}
      className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary rounded-xl p-4 transition-all duration-200 text-left group hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-active rounded-xl flex flex-col items-center justify-center shadow-primary">
            <span className="text-lg font-bold text-white">{cita.horaCita}</span>
            <span className="text-2xs text-white opacity-90">{cita.duracionEstimada}min</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-2sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                {cita.pacienteNombre}
              </h4>
              <p className="text-2xs text-gray-600 font-medium">
                CC: {cita.pacienteIdentificacion}
              </p>
            </div>
            {getEstadoBadge(cita.estado)}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-md border text-2xs font-medium ${getTipoCitaColor(cita.tipoCita)}`}>
              {getTipoCitaLabel(cita.tipoCita)}
            </span>
          </div>

          {cita.motivoConsulta && (
            <p className="text-2xs text-gray-600 line-clamp-2">
              {cita.motivoConsulta}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 self-center">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};
