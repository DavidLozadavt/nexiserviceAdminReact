import React from 'react';
import { Paciente } from '../../gestion-pacientes/types';

interface PacienteHeaderProps {
  paciente: Paciente;
  onClose?: () => void;
}

export const PacienteHeader: React.FC<PacienteHeaderProps> = ({ 
  paciente, 
  onClose
}) => {
  const calcularEdad = (fechaNac: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const getIniciales = (nombre: string): string => {
    const nombreCompleto = `${paciente.nombre1} ${paciente.apellido1}`.trim();
    const partes = nombreCompleto.split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombreCompleto.substring(0, 2).toUpperCase();
  };

  const getSexoInfo = (sexo: string) => {
    if (sexo === 'M') {
      return {
        color: 'bg-info-light text-info border-info-clarity',
        label: 'Masculino',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      };
    } else if (sexo === 'F') {
      return {
        color: 'bg-primary-light text-primary border-primary-clarity',
        label: 'Femenino',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      };
    }
    return {
      color: 'bg-gray-100 text-gray-600 border-gray-300',
      label: 'Otro',
      icon: null
    };
  };

  const edad = calcularEdad(paciente.fechaNac);
  const sexoInfo = getSexoInfo(paciente.sexo);
  const nombreCompleto = `${paciente.nombre1} ${paciente.apellido1} `.trim();

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden mb-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-active to-primary-active p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {getIniciales(nombreCompleto)}
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-white">
                  {nombreCompleto}
                </h1>
                <div className={`px-2 py-1 rounded-lg border ${sexoInfo.color} text-2xs font-semibold flex items-center gap-1 bg-white`}>
                  {sexoInfo.icon}
                  {sexoInfo.label}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-white text-sm">
                <div className="flex items-center gap-1.5 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <span className="font-semibold">{paciente.tipoIdentificacion}</span>
                  <span className="font-bold">{paciente.identificacion}</span>
                </div>
                
                <div className="flex items-center gap-1.5 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-bold">{edad} años</span>
                </div>
              </div>
            </div>
          </div>

          {onClose && (
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white hover:bg-opacity-30 transition-all duration-200 flex-shrink-0"
              title="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {paciente.eps && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-2xs text-gray-500 font-medium">EPS</p>
                <p className="text-2sm text-gray-900 font-semibold">{paciente.eps}</p>
              </div>
            </div>
          )}

          {paciente.telefono && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-2xs text-gray-500 font-medium">Teléfono</p>
                <p className="text-2sm text-gray-900 font-semibold">{paciente.telefono}</p>
              </div>
            </div>
          )}

          {paciente.idCiudad && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xs text-gray-500 font-medium">Ciudad</p>
                <p className="text-2sm text-gray-900 font-semibold">{paciente.idCiudad}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};