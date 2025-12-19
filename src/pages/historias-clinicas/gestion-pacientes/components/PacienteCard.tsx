import React from 'react';
import { Paciente } from '../types';

interface PacienteCardProps {
  paciente: Paciente;
  onVerHistoria: () => void;
  onVerDocumentos: () => void;
  onVerSeguimiento: () => void;
}

export const PacienteCard: React.FC<PacienteCardProps> = ({
  paciente,
  onVerHistoria,
  onVerDocumentos,
  onVerSeguimiento
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
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  const getSexoIcon = (sexo: string) => {
    if (sexo === 'M') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    } else if (sexo === 'F') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    }
    return null;
  };

  const getSexoColor = (sexo: string) => {
    if (sexo === 'M') return 'bg-info-light text-info border-info-clarity';
    if (sexo === 'F') return 'bg-primary-light text-primary border-primary-clarity';
    return 'bg-gray-100 dark:bg-gray-400 text-gray-600 dark:text-gray-100 border-gray-300 dark:border-gray-500';
  };

  const edad = calcularEdad(paciente.fechaNac);

  return (
    <div className="bg-white dark:bg-coal-300 rounded-2xl shadow-card dark:shadow-none border border-gray-200 dark:border-coal-100 overflow-hidden max-w-2xl mx-auto">
      <div className="relative overflow-hidden bg-gradient-to-br from-success via-success-active to-success-active p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg dark:shadow-none">
              <span className="text-2xl font-bold text-success">
                {getIniciales(paciente.nombre1)}
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white">
                  {paciente.nombre}
                </h3>
                <div className={`px-2 py-0.5 rounded-full border ${getSexoColor(paciente.sexo)} text-2xs font-medium flex items-center gap-1 bg-white dark:bg-coal-300`}>
                  {getSexoIcon(paciente.sexo)}
                  {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : 'Otro'}
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-white text-sm">
                <div className="flex items-center gap-1.5 bg-white bg-opacity-20 px-2.5 py-1 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <span className="font-medium">{paciente.tipoIdentificacion}</span>
                  <span className="font-semibold">{paciente.identificacion}</span>
                </div>
                
                <div className="flex items-center gap-1.5 bg-white bg-opacity-20 px-2.5 py-1 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">{edad} años</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white border-opacity-30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-white">Activo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-coal-200 dark:to-coal-300 border-b border-gray-200 dark:border-coal-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider">Acciones Rápidas</span>
          <div className="flex gap-2">
            <button
              onClick={onVerHistoria}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-coal-400 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-100 border-2 border-gray-200 dark:border-coal-100 hover:border-primary rounded-lg transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-primary dark:hover:shadow-none group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Historia Clínica
            </button>
            
            <button
              onClick={onVerDocumentos}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-coal-400 hover:bg-warning hover:text-white text-gray-700 dark:text-gray-100 border-2 border-gray-200 dark:border-coal-100 hover:border-warning rounded-lg transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-warning dark:hover:shadow-none group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Documentos
            </button>
            
            <button
              onClick={onVerSeguimiento}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-coal-400 hover:bg-info hover:text-white text-gray-700 dark:text-gray-100 border-2 border-gray-200 dark:border-coal-100 hover:border-info rounded-lg transition-all duration-200 text-xs font-semibold shadow-sm hover:shadow-info dark:hover:shadow-none group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Seguimiento
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contacto</h4>
            </div>
            
            {paciente.telefono && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-coal-200 rounded-lg border border-gray-200 dark:border-coal-100">
                <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xs text-gray-500 dark:text-gray-600 font-medium mb-0.5">Teléfono</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold truncate">{paciente.telefono}</p>
                </div>
              </div>
            )}
            
            {paciente.email && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-coal-200 rounded-lg border border-gray-200 dark:border-coal-100">
                <div className="w-8 h-8 bg-info-light rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xs text-gray-500 dark:text-gray-600 font-medium mb-0.5">Email</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold truncate">{paciente.email}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-warning-light rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Ubicación</h4>
            </div>
            
            {paciente.direccion && (
              <div className="p-3 bg-gray-50 dark:bg-coal-200 rounded-lg border border-gray-200 dark:border-coal-100">
                <p className="text-2xs text-gray-500 dark:text-gray-600 font-medium mb-1">Dirección</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{paciente.direccion}</p>
              </div>
            )}
            
            {paciente.idCiudad && (
              <div className="p-3 bg-gray-50 dark:bg-coal-200 rounded-lg border border-gray-200 dark:border-coal-100">
                <p className="text-2xs text-gray-500 dark:text-gray-600 font-medium mb-1">Ciudad</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{paciente.idCiudad}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-danger-light rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Información Médica</h4>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-coal-200 rounded-lg border border-gray-200 dark:border-coal-100">
              <p className="text-2xs text-gray-500 dark:text-gray-600 font-medium mb-1">Fecha de Nacimiento</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{paciente.fechaNac}</p>
            </div>
            
            {paciente.eps && (
              <div className="p-3 bg-gradient-to-br from-success-light to-white dark:from-success-clarity dark:to-coal-300 rounded-lg border border-success-clarity">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-2xs text-success font-semibold">EPS Afiliada</p>
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-bold">{paciente.eps}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-coal-200 dark:to-coal-300 border-t border-gray-200 dark:border-coal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-xs text-gray-600 dark:text-gray-700">Paciente registrado</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-gray-600 dark:text-gray-700">Última actualización: Hoy</span>
            </div>
          </div>
          
          <button className="text-xs text-primary hover:text-primary-active font-semibold flex items-center gap-1 transition-colors">
            Ver perfil completo
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};