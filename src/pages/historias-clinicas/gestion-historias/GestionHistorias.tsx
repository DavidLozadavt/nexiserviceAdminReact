import React, { useState } from 'react';
import { Paciente } from '../gestion-pacientes/types';
import { HistoriaClinica } from './types';
import { HistoriaClinicaForm } from './HistoriaClinicaForm';
import EvolucionClinicaForm from '../evoluciones/EvolucionClinicaForm';

// Componentes modularizados
import { AlertaProximasCitas } from './components/AlertaProximasCitas';
import { PacienteHeader } from './components/PacienteHeader';
import { HistoriaCard } from './components/HistoriaCard';
import { EmptyState } from './components/EmptyState';

// Hooks personalizados
import { useHistoriasManager } from './hooks/useHistoriasManager';
import { useProximasCitas } from './hooks/useProximasCitas';
import { useHistorialExpandido } from './hooks/useHistorialExpandido';
import { useFormEvolucion } from './hooks/useFormEvolucion';

interface GestionHistoriasProps {
  paciente: Paciente;
  onClose?: () => void;
  setHistoriasPaciente?: (historias: HistoriaClinica[]) => void;
}

export const GestionHistorias: React.FC<GestionHistoriasProps> = ({ 
  paciente, 
  onClose, 
  setHistoriasPaciente 
}) => {
  console.log('Paciente recibido en GestionHistorias:', paciente);
  const [showForm, setShowForm] = useState(false);

  // Gestión de historias clínicas
  const {
    historiasPaciente,
    historiaEditando,
    setHistoriaEditando,
    handleGuardarHistoria,
    handleAdjuntarArchivo,
    handleAddEvolucion,
    getNombreUsuario,
  } = useHistoriasManager({ 
    paciente, 
    setHistoriasPaciente, 
    usuario: { first_name: 'Usuario', last_name: 'Temporal' } // Usuario temporal mientras no hay autenticación
  });

  // Escuchar el evento para abrir el formulario
  React.useEffect(() => {
    const handleAbrirFormulario = () => {
      console.log('Evento recibido: abrirFormularioHistoriaClinica');
      setShowForm(true);
      setHistoriaEditando(null);
    };

    document.addEventListener('abrirFormularioHistoriaClinica', handleAbrirFormulario);
    
    return () => {
      document.removeEventListener('abrirFormularioHistoriaClinica', handleAbrirFormulario);
    };
  }, [setHistoriaEditando]);

  // Gestión de próximas citas
  const proximasCitas = useProximasCitas(historiasPaciente, paciente);

  // Gestión de historial expandido
  const { historialExpandido, toggleHistorial } = useHistorialExpandido();

  // Gestión de formulario de evolución
  const { 
    abrirFormEvolucion, 
    cerrarFormEvolucion, 
    estaAbierto 
  } = useFormEvolucion();

  // Handler para nueva historia
  const handleNuevaHistoria = () => {
    setShowForm(true);
    setHistoriaEditando(null);
  };

  // Handler para editar historia
  const handleEditarHistoria = (historia: HistoriaClinica) => {
    setHistoriaEditando(historia);
    setShowForm(true);
  };

  // Handler para cancelar formulario
  const handleCancelarForm = () => {
    setShowForm(false);
    setHistoriaEditando(null);
  };

  // Handler para guardar y cerrar formulario
  const handleGuardarYCerrar = (historia: HistoriaClinica) => {
    handleGuardarHistoria(historia);
    setShowForm(false);
  };

  // Handler para agregar evolución y cerrar formulario
  const handleAgregarEvolucion = (historiaId: string) => (evolucion: any) => {
    handleAddEvolucion(historiaId, evolucion);
    cerrarFormEvolucion();
  };

  return (
    <>
      <AlertaProximasCitas citas={proximasCitas} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <PacienteHeader
            paciente={paciente}
            onClose={onClose}
          />

          {showForm && (
            <div className="mb-8">
              <HistoriaClinicaForm
                historiaExistente={historiaEditando ?? undefined}
                onGuardar={handleGuardarYCerrar}
                onCancelar={handleCancelarForm}
              />
            </div>
          )}

          {historiasPaciente.length > 0 ? (
            <div className="space-y-6">
              {historiasPaciente.map((historia, idx) => {
                const numeroHistoria = (idx + 1).toString().padStart(2, '0');
                return (
                  <HistoriaCard
                    key={historia.id}
                    historia={historia}
                    numeroHistoria={numeroHistoria}
                    onEditar={() => handleEditarHistoria(historia)}
                    onAdjuntar={(file) => handleAdjuntarArchivo(historia.id, file)}
                    onRegistrarEvolucion={() => abrirFormEvolucion(historia.id)}
                    mostrandoFormEvolucion={estaAbierto(historia.id)}
                    formEvolucionComponent={
                      estaAbierto(historia.id) && (
                        <div className="mt-8">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-2sm font-semibold text-gray-900">
                                Registrar Evolución Clínica
                              </h4>
                              <button
                                onClick={cerrarFormEvolucion}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <EvolucionClinicaForm
                              onAddEvolucion={handleAgregarEvolucion(historia.id)}
                              responsable={getNombreUsuario()}
                            />
                          </div>
                        </div>
                      )
                    }
                    historialExpandido={historialExpandido[historia.id] || false}
                    onToggleHistorial={() => toggleHistorial(historia.id)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState onNuevaHistoria={handleNuevaHistoria} />
          )}
        </div>
      </div>
    </>
  );
};