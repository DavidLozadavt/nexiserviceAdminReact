import React from 'react';
import { useLocation } from 'react-router-dom';
import { PacienteForm } from './PacienteForm';
import { GestionHistorias } from '../gestion-historias/GestionHistorias';
import { ModalDocumentosAdjuntos } from '../gestion-historias/ModalDocumentosAdjuntos';
import { useGestionPacientes } from './hooks/useGestionPacientes';
import { PageHeader } from './components/PageHeader';
import { MensajeAlerta } from './components/MensajeAlerta';
import { EstadisticasPacientes } from './components/EstadisticasPacientes';
import { ModalOverlay } from './components/ModalOverlay';
import { PacienteCard } from './components/PacienteCard';
import { ListaPacientesCitas } from './components/ListaPacientesCitas';

export const GestionPacientes: React.FC = () => {
  console.log('[GestionPacientes] Componente renderizado');
  // Validación de datos completos
  const pacienteCompleto = (paciente: any) => {
    if (!paciente) return false;
    return (
      paciente.nombre1 &&
      paciente.apellido1 &&
      paciente.identificacion &&
      paciente.fechaNac &&
      paciente.telefono &&
      paciente.direccion &&
      paciente.email &&
      paciente.tipoIdentificacion &&
      paciente.idCiudad
    );
  };
  const {
    identificacion,
    pacientes,
    pacienteEncontrado,
    showForm,
    mensaje,
    tipoMensaje,
    pacienteParaHistoria,
    showDocumentosModal,
    historiasPaciente,
    setIdentificacion,
    setHistoriasPaciente,
    handleBuscar,
    handleGuardar,
    handleVerHistoria,
    handleMostrarHistorias,
    handleVerDocumentos,
    handleVerSeguimiento,
    handleCerrarHistoria,
    handleCerrarDocumentos,
    handleCancelarForm
  } = useGestionPacientes();

  const location = useLocation();
  const pacienteMock = {
    id: '1',
    identificacion: '1234567890',
    nombre: 'Juan Carlos Pérez García',
    nombre1: 'Juan Carlos',
    apellido1: 'Pérez García',
    direccion: 'Calle Falsa 123',
    email: 'juan.perez@example.com',
    telefono: '',
    tipoIdentificacion: 'CC',
    idCiudad: 'Bogotá',
    sexo: 'M',
    fechaNac: '1985-05-15',
    eps: 'EPS Salud Total'
  };

  console.log('Valor de pacienteParaHistoria:', pacienteParaHistoria);
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-6">        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {!pacienteEncontrado ? 'Gestión de Pacientes' : 'Datos del Paciente'}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          {!pacienteEncontrado
            ? 'Busca pacientes existentes o registra nuevos pacientes en el sistema'
            : 'Consulta y gestiona la información del paciente seleccionado'}
        </p>

        {!pacienteEncontrado && (
          <>
            <ListaPacientesCitas
              medicoId="medico123"
              onSeleccionarPaciente={handleVerHistoria}
            />
            {mensaje && (
              <div className="px-7.5">
                <MensajeAlerta mensaje={mensaje} tipo={tipoMensaje} />
              </div>
            )}
            <EstadisticasPacientes totalPacientes={pacientes.length} />
          </>
        )}

        {pacienteEncontrado && (
          pacienteCompleto(pacienteEncontrado) ? (
            <PacienteCard
              paciente={pacienteEncontrado}
              onVerHistoria={handleMostrarHistorias}
              onVerDocumentos={handleVerDocumentos}
              onVerSeguimiento={handleVerSeguimiento}
            />
          ) : (
            <PacienteForm
              identificacion={pacienteEncontrado.identificacion}
              paciente={pacienteEncontrado}
              onGuardar={handleGuardar}
              onCancelar={handleCancelarForm}
            />
          )
        )}

        {showForm && (
          <PacienteForm
            identificacion={identificacion}
            onGuardar={handleGuardar}
            onCancelar={handleCancelarForm}
          />
        )}

        {(pacienteParaHistoria && !showDocumentosModal) ? (
          <ModalOverlay>
            <GestionHistorias
              paciente={pacienteMock}
              onClose={handleCerrarHistoria}
              setHistoriasPaciente={setHistoriasPaciente}
            />
          </ModalOverlay>
        ) : location.pathname === '/paciente/1' ? (
          <GestionHistorias
            paciente={pacienteMock}
            onClose={handleCerrarHistoria}
            setHistoriasPaciente={setHistoriasPaciente}
          />
        ) : null}

        {pacienteEncontrado && showDocumentosModal && (
          <ModalDocumentosAdjuntos
            paciente={pacienteEncontrado}
            historias={historiasPaciente}
            onClose={handleCerrarDocumentos}
          />
        )}
      </div>
    </div>
  );
}