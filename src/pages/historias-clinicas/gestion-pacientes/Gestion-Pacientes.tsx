import React, { useState } from 'react';
import { PacienteForm } from './PacienteForm';
import { Paciente } from './types';
import { GestionHistorias } from '../gestion-historias/GestionHistorias';
import { ModalDocumentosAdjuntos } from '../gestion-historias/ModalDocumentosAdjuntos';

const mockPacientes: Paciente[] = [];

export const GestionPacientes: React.FC = () => {
  const [identificacion, setIdentificacion] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>(mockPacientes);
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  const [pacienteParaHistoria, setPacienteParaHistoria] = useState<Paciente | null>(null);
  const [showDocumentosModal, setShowDocumentosModal] = useState(false);
  const [historiasPaciente, setHistoriasPaciente] = useState<import('../gestion-historias/types').HistoriaClinica[]>([]);

  const handleBuscar = () => {
    setMensaje('');
    if (!identificacion.trim()) {
      setPacienteEncontrado(null);
      setShowForm(false);
      setMensaje('Por favor ingresa una identificación válida.');
      setTipoMensaje('warning');
      return;
    }
    
    const paciente = pacientes.find(p => p.identificacion === identificacion);
    if (paciente) {
      setPacienteEncontrado(paciente);
      setShowForm(false);
      setMensaje('Paciente encontrado exitosamente.');
      setTipoMensaje('success');
    } else {
      setPacienteEncontrado(null);
      setShowForm(true);
      setMensaje('Paciente no encontrado. Puedes registrar un nuevo paciente.');
      setTipoMensaje('info');
    }
  };

  const handleGuardar = (nuevoPaciente: Paciente) => {
    if (pacientes.some(p => p.identificacion === nuevoPaciente.identificacion)) {
      setMensaje('Ya existe un paciente registrado con esa identificación.');
      setTipoMensaje('error');
      return;
    }
    setPacientes([...pacientes, nuevoPaciente]);
    setShowForm(false);
    setPacienteEncontrado(nuevoPaciente);
    setMensaje('Paciente registrado exitosamente en el sistema.');
    setTipoMensaje('success');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBuscar();
    }
  };

  const getMensajeClasses = () => {
    const baseClasses = "px-4 py-3 rounded-lg border text-2sm font-medium mb-6";
    switch (tipoMensaje) {
      case 'success':
        return `${baseClasses} bg-success-light border-success text-success`;
      case 'warning':
        return `${baseClasses} bg-warning-light border-warning text-warning`;
      case 'error':
        return `${baseClasses} bg-danger-light border-danger text-danger`;
      default:
        return `${baseClasses} bg-info-light border-info text-info`;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2.5xl font-bold text-gray-900 mb-2">
            Gestión de Pacientes
          </h1>
          <p className="text-md text-gray-600">
            Busca pacientes existentes o registra nuevos pacientes en el sistema
          </p>
        </div>

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
                  onChange={e => setIdentificacion(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div className="sm:self-end">
                <button
                  className="btn btn-lg bg-primary hover:bg-primary-active text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-primary w-full sm:w-auto"
                  onClick={handleBuscar}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar
                </button>
              </div>
            </div>
          </div>

          <div className="px-7.5 py-6">
            {mensaje && (
              <div className={getMensajeClasses()}>
                <div className="flex items-center">
                  {tipoMensaje === 'success' && (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {tipoMensaje === 'warning' && (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {tipoMensaje === 'error' && (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {tipoMensaje === 'info' && (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                  {mensaje}
                </div>
              </div>
            )}

            {pacienteEncontrado && (
              <div className="bg-success-light border border-success rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-1.5xl font-semibold text-gray-900">
                        Paciente Encontrado
                      </h3>
                      <p className="text-2sm text-gray-600">
                        Información del paciente en el sistema
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <h4 className="text-2xs font-medium text-gray-500 uppercase tracking-wider mb-1">Acciones</h4>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg transition-all duration-200 text-2xs font-medium shadow-sm hover:shadow-md"
                        onClick={() => {
                          setPacienteParaHistoria(pacienteEncontrado);
                          setShowDocumentosModal(false);
                        }}
                      >
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Historia
                      </button>
                      <button
                        className="btn btn-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg transition-all duration-200 text-2xs font-medium shadow-sm hover:shadow-md"
                        onClick={() => {
                          setShowDocumentosModal(true);
                          setPacienteParaHistoria(null);
                        }}
                      >
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        Documentos
                      </button>
                      <button
                        className="btn btn-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg transition-all duration-200 text-2xs font-medium shadow-sm hover:shadow-md"
                        onClick={() => {}}
                      >
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Seguimiento
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <span className="text-2xs font-medium text-gray-500 uppercase tracking-wider">Nombre</span>
                    <p className="text-2sm font-medium text-gray-900">{pacienteEncontrado.nombreCompleto}</p>
                  </div>
                  <div>
                    <span className="text-2xs font-medium text-gray-500 uppercase tracking-wider">Identificación</span>
                    <p className="text-2sm font-medium text-gray-900">
                      {pacienteEncontrado.tipoIdentificacion} {pacienteEncontrado.identificacion}
                    </p>
                  </div>
                  <div>
                    <span className="text-2xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Nacimiento</span>
                    <p className="text-2sm font-medium text-gray-900">{pacienteEncontrado.fechaNacimiento}</p>
                  </div>
                  <div>
                    <span className="text-2xs font-medium text-gray-500 uppercase tracking-wider">Sexo</span>
                    <p className="text-2sm font-medium text-gray-900">
                      {pacienteEncontrado.sexo === 'M' ? 'Masculino' : pacienteEncontrado.sexo === 'F' ? 'Femenino' : 'Otro'}
                    </p>
                  </div>
                  {pacienteEncontrado.telefono && (
                    <div>
                      <span className="text-2xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</span>
                      <p className="text-2sm font-medium text-gray-900">{pacienteEncontrado.telefono}</p>
                    </div>
                  )}
                  {pacienteEncontrado.correo && (
                    <div>
                      <span className="text-2xs font-medium text-gray-500 uppercase tracking-wider">Email</span>
                      <p className="text-2sm font-medium text-gray-900">{pacienteEncontrado.correo}</p>
                    </div>
                  )}
                </div>

                {(pacienteEncontrado.direccion || pacienteEncontrado.ciudad || pacienteEncontrado.eps) && (
                  <div className="mt-4 pt-4 border-t border-success-clarity">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pacienteEncontrado.direccion && (
                        <div>
                          <span className="text-2xs font-medium text-gray-500 uppercase tracking-wider">Dirección</span>
                          <p className="text-2sm font-medium text-gray-900">{pacienteEncontrado.direccion}</p>
                        </div>
                      )}
                      {pacienteEncontrado.ciudad && (
                        <div>
                          <span className="text-2xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</span>
                          <p className="text-2sm font-medium text-gray-900">{pacienteEncontrado.ciudad}</p>
                        </div>
                      )}
                      {pacienteEncontrado.eps && (
                        <div>
                          <span className="text-2xs font-medium text-gray-500 uppercase tracking-wider">EPS</span>
                          <p className="text-2sm font-medium text-gray-900">{pacienteEncontrado.eps}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {pacientes.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-2sm font-medium text-gray-600">
                    Total de pacientes registrados
                  </span>
                  <span className="text-1.5xl font-bold text-primary">
                    {pacientes.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {showForm && (
          <PacienteForm
            identificacion={identificacion}
            onGuardar={handleGuardar}
            onCancelar={() => setShowForm(false)}
          />
        )}


      {pacienteParaHistoria && !showDocumentosModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ minWidth: 600, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <GestionHistorias
              paciente={pacienteParaHistoria}
              onClose={() => setPacienteParaHistoria(null)}
              setHistoriasPaciente={setHistoriasPaciente}
            />
          </div>
        </div>
      )}

      {/* Modal de Documentos adjuntos */}
      {pacienteEncontrado && showDocumentosModal && (
        <ModalDocumentosAdjuntos
          paciente={pacienteEncontrado}
          historias={historiasPaciente}
          onClose={() => setShowDocumentosModal(false)}
        />
      )}
      </div>
    </div>
  );
};