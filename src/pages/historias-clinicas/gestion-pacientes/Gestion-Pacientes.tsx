// ...existing code...
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
import { SeguimientoPaciente } from '../seguimiento';

// Adaptador para historias de seguimiento
import { Paciente } from './types';
// Adaptador para historias de seguimiento con tipado
function adaptarHistoriasParaSeguimiento(historias: any[]): Array<{ id: string; fechaCreacion: string; datosFisicos?: any }> {
  return (historias || []).map((h: any) => ({
    id: h.id,
    fechaCreacion: h.fechaCreacion || h.fecha_creacion || '',
    datosFisicos: h.examenFisico
      ? {
          peso: h.examenFisico.peso,
          altura: h.examenFisico.altura,
          presionArterial: h.examenFisico.presionArterial,
          frecuenciaCardiaca: h.examenFisico.frecuenciaCardiaca
        }
      : undefined
  }));
}

export const GestionPacientes: React.FC = () => {
  // Estado para prellenar el formulario con datos de la cita
  const [prellenadoCita, setPrellenadoCita] = React.useState<any>(null);
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
    setShowForm,
    handleBuscar,
    handleGuardar,
    handleVerHistoria,
    handleMostrarHistorias,
    handleVerDocumentos,
    handleVerSeguimiento,
    handleCerrarSeguimiento,
    handleCerrarHistoria,
    handleCerrarDocumentos,
    handleCancelarForm,
    showSeguimiento
  } = useGestionPacientes();

  const location = useLocation();

  // Ocultar el formulario si el paciente ya está registrado
  // Ocultar el formulario si el paciente ya está registrado
  React.useEffect(() => {
    if (pacienteEncontrado && showForm) {
      setShowForm(false);
    }
  }, [pacienteEncontrado, showForm, setShowForm]);


  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {!pacienteEncontrado ? 'Gestión de Pacientes' : 'Datos del Paciente'}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-700 mb-6">
          {!pacienteEncontrado
            ? 'Busca pacientes existentes o registra nuevos pacientes en el sistema'
            : 'Consulta y gestiona la información del paciente seleccionado'}
        </p>

        {!pacienteEncontrado && (
          <>
            <ListaPacientesCitas
              medicoId="medico123"
              onSeleccionarPaciente={async (cita) => {
                await handleVerHistoria(cita.pacienteIdentificacion);
                setTimeout(() => {
                  if (!pacienteEncontrado) {
                    setIdentificacion(cita.pacienteIdentificacion);
                    // Extraer datos del cliente usando as any para evitar error de tipado
                    const citaAny = cita as any;
                    let nombre1 = '';
                    let apellido1 = '';
                    let email = '';
                    let telefono = '';
                    let direccion = '';
                    if (citaAny.cliente) {
                                            console.log('Cliente recibido en cita:', citaAny.cliente);
                      if (citaAny.cliente.nombre) {
                        const partes = citaAny.cliente.nombre.split(' ');
                        nombre1 = partes[0] || '';
                        apellido1 = partes.slice(1).join(' ');
                      }
                      email = citaAny.cliente.email || '';
                      telefono = citaAny.cliente.telefono || '';
                      direccion = citaAny.cliente.direccion || '';
                    } else if (cita.pacienteNombre) {
                      const partes = cita.pacienteNombre.split(' ');
                      nombre1 = partes[0] || '';
                      apellido1 = partes.slice(1).join(' ');
                    }
                    const prellenado = {
                      nombre1,
                      apellido1,
                      identificacion: cita.pacienteIdentificacion,
                      email,
                      telefono,
                      direccion
                    };
                    console.log('Prellenado para PacienteForm:', prellenado);
                    setPrellenadoCita(prellenado);
                    setShowForm(true);
                  }
                }, 200);
              }}
            />
            {mensaje && (
              <div className="px-7.5">
                <MensajeAlerta mensaje={mensaje} tipo={tipoMensaje} />
              </div>
            )}
            <EstadisticasPacientes totalPacientes={pacientes.length} />
          </>
        )}

        {pacienteEncontrado && showSeguimiento ? (
          <div>
            <button onClick={handleCerrarSeguimiento} className="mb-4 px-4 py-2 bg-gray-200 dark:bg-coal-200 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-coal-400 rounded transition-colors">
              Volver
            </button>
            <SeguimientoPaciente 
              paciente={{
                ...pacienteEncontrado,
                id: String(pacienteEncontrado.id),
                nombreCompleto: `${pacienteEncontrado.nombre1 || ''} ${pacienteEncontrado.apellido1 || ''}`.trim() || pacienteEncontrado.nombre || ''
              }}
              historias={adaptarHistoriasParaSeguimiento(historiasPaciente)} 
              onClose={handleCerrarSeguimiento} 
            />
          </div>
        ) : pacienteEncontrado && (
          <PacienteCard
            paciente={pacienteEncontrado}
            onVerHistoria={handleMostrarHistorias}
            onVerDocumentos={handleVerDocumentos}
            onVerSeguimiento={handleVerSeguimiento}
          />
        )}

        {showForm && (
          <PacienteForm
            identificacion={identificacion}
            paciente={prellenadoCita}
            onGuardar={handleGuardar}
            onCancelar={handleCancelarForm}
          />
        )}

        {(pacienteParaHistoria && !showDocumentosModal && pacienteEncontrado) ? (
          <ModalOverlay>
            <GestionHistorias
              paciente={pacienteEncontrado}
              onClose={handleCerrarHistoria}
              setHistoriasPaciente={setHistoriasPaciente}
            />
          </ModalOverlay>
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