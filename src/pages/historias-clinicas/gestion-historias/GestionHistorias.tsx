import React, { useState } from 'react';
import { Paciente } from '../gestion-pacientes/types';
import { HistoriaClinica } from './types';
import { HistoriaClinicaForm } from './HistoriaClinicaForm';
import EvolucionClinicaForm from '../evoluciones/EvolucionClinicaForm';
import { getTipoColor, getTipoIcon } from './utils';
import { obtenerCieDiagnosticos } from './cieService';

// Componentes modularizados
import { AlertaProximasCitas } from './components/AlertaProximasCitas';
import { PacienteHeader } from './components/PacienteHeader';
import { HistoriaCard } from './components/HistoriaCard';
import { Modal } from '@/components/modal/Modal';
import { AntecedentesDisplay } from './components/AntecedentesDisplay';
import { EmptyState } from './components/EmptyState';
import { BotonFlotante } from './components/BotonFlotante';

// Hooks personalizados
import { useHistoriasManager } from './hooks/useHistoriasManager';
import { Snackbar } from '@/components/Snackbar';
import { useProximasCitas } from './hooks/useProximasCitas';
import { useHistorialExpandido } from './hooks/useHistorialExpandido';
import { useFormEvolucion } from './hooks/useFormEvolucion';

interface GestionHistoriasProps {
  paciente: Paciente;
  onClose?: () => void;
  setHistoriasPaciente?: (historias: HistoriaClinica[]) => void;
  // Cuando es false, se deshabilita la creación de nuevas historias (solo permitir evoluciones)
  allowCrearHistoria?: boolean;
}

export const GestionHistorias: React.FC<GestionHistoriasProps> = ({ 
  paciente, 
  onClose, 
  setHistoriasPaciente,
  allowCrearHistoria = true
}) => {
  const [showForm, setShowForm] = useState(false);
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const historiasPorPagina = 5;

  // Gestión de historias clínicas
  const {
    historiasPaciente,
    historiaEditando,
    setHistoriaEditando,
    handleGuardarHistoria,
    handleAdjuntarArchivo,
    handleAddEvolucion,
    getNombreUsuario,
    cargarAntecedentesHistoria,
    snackbar,
    setSnackbar
  } = useHistoriasManager({ 
    paciente, 
    setHistoriasPaciente, 
    usuario: { first_name: 'Usuario', last_name: 'Temporal' }
  });

  // Cálculos de paginación
  const totalPaginas = Math.ceil(historiasPaciente.length / historiasPorPagina);
  const indiceInicio = (paginaActual - 1) * historiasPorPagina;
  const indiceFin = indiceInicio + historiasPorPagina;
  const historiasPaginadas = historiasPaciente.slice(indiceInicio, indiceFin);


  // Resetear a página 1 cuando cambien las historias
  React.useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    }
  }, [historiasPaciente.length, totalPaginas, paginaActual]);

  // Escuchar el evento para abrir el formulario
  React.useEffect(() => {
    const handleAbrirFormulario = () => {
      if (!allowCrearHistoria) return;
      setShowForm(true);
      setHistoriaEditando(null);
    };

    document.addEventListener('abrirFormularioHistoriaClinica', handleAbrirFormulario);
    
    return () => {
      document.removeEventListener('abrirFormularioHistoriaClinica', handleAbrirFormulario);
    };
  }, [setHistoriaEditando, allowCrearHistoria]);

  // Si la vista no permite crear historias, forzar cierre de cualquier formulario abierto
  React.useEffect(() => {
    if (!allowCrearHistoria) {
      setShowForm(false);
      setHistoriaEditando(null);
    }
  }, [allowCrearHistoria, setHistoriaEditando]);

  // Gestión de próximas citas
  const proximasCitas = useProximasCitas(historiasPaciente, paciente);

  // Gestión de historial expandido
  const { historialExpandido, toggleHistorial } = useHistorialExpandido();

  // Gestión de formulario de evolución
  const {
    abrirFormEvolucion,
    cerrarFormEvolucion,
    mostrandoFormEvolucion,
  } = useFormEvolucion();

  // Handler para nueva historia
  const handleNuevaHistoria = () => {
    if (!allowCrearHistoria) return;
    setShowForm(true);
    setHistoriaEditando(null);
  };

  // Handler para editar historia
  const handleEditarHistoria = (historia: HistoriaClinica) => {
    if (!allowCrearHistoria) return;
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

  // Estado para modal de detalle
  const [historiaSeleccionada, setHistoriaSeleccionada] = useState<HistoriaClinica | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const handleAbrirModal = (historia: HistoriaClinica) => {
    cargarAntecedentesHistoria(historia.id);
    setHistoriaSeleccionada(historia);
    setModalAbierto(true);
  };
  
  const handleCerrarModal = () => {
    setModalAbierto(false);
    setHistoriaSeleccionada(null);
  };

  // Estado y carga de cieCatalogo
  const [cieCatalogo, setCieCatalogo] = useState<Array<{ id: number; codigo: string; descripcion: string }>>([]);

  React.useEffect(() => {
    obtenerCieDiagnosticos().then(data => {
      setCieCatalogo(data);
    });
  }, []);

  // Funciones de navegación de paginación
  const irAPagina = (numeroPagina: number) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      irAPagina(paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      irAPagina(paginaActual + 1);
    }
  };

  return (
    <>
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
      <AlertaProximasCitas citas={proximasCitas} />
      <div className="container min-h-screen px-6 py-8 mx-auto transition-colors">
        <div className="max-w-5xl mx-auto">
          <PacienteHeader paciente={paciente} onClose={onClose} />

          {allowCrearHistoria && showForm && (
            <div className="mb-7.5 bg-light dark:bg-coal-300 rounded-xl border border-gray-200 dark:border-gray-700 shadow-card transition-colors">
              <HistoriaClinicaForm
                historiaExistente={historiaEditando ? {
                  ...historiaEditando,
                  diagnosticos: historiaEditando.diagnosticos ?? [],
                  tratamiento: historiaEditando.tratamiento ?? [],
                  antecedentes: historiaEditando.antecedentes ?? [],
                  historialCambios: historiaEditando.historialCambios ?? [],
                  adjuntos: historiaEditando.adjuntos ?? [],
                  examenFisico: historiaEditando.examenFisico ?? {},
                  evoluciones: historiaEditando.evoluciones ?? [],
                } : undefined}
                onGuardar={handleGuardarYCerrar}
                onCancelar={handleCancelarForm}
                pacienteId={paciente.id}
              />
            </div>
          )}

          {historiasPaciente.length > 0 ? (
            <>
              <div className="space-y-5">
              {historiasPaginadas.map((historia, idx) => {
                const numeroHistoria = (indiceInicio + idx + 1).toString().padStart(2, '0');
                return (
                  <div 
                    key={historia.id}
                    className="overflow-hidden transition-all duration-200 border border-gray-200 cursor-pointer card bg-light dark:bg-coal-300 shadow-card dark:border-gray-700 rounded-xl hover:shadow-default group"
                    onClick={() => handleAbrirModal(historia)}
                  >
                    <div className="px-7.5 py-4.5">
                      <div className="flex items-start justify-between gap-4">
                        {/* Columna izquierda - Info principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2.75">
                            {/* Badge de tipo */}
                            <div className={`inline-flex items-center px-2.75 py-1 rounded-full text-3xs font-medium border ${getTipoColor(historia.tipo)}`}> 
                              {getTipoIcon(historia.tipo)}
                              <span className="ml-1.5 capitalize">{historia.tipo}</span>
                            </div>
                            
                            {/* Número de historia */}
                            <h3 className="font-semibold text-gray-900 text-md dark:text-gray-100">
                              Historia #{numeroHistoria}
                            </h3>
                          </div>

                          {/* Motivo de consulta - Preview */}
                          <p className="mb-2 text-gray-700 transition-colors text-2sm dark:text-gray-300 line-clamp-2 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                            {historia.motivoConsulta}
                          </p>

                          {/* Diagnóstico - Preview */}
                          {historia.diagnosticos && (
                            <div className="flex items-start gap-2 mb-2.75">
                              <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <p className="flex-1 text-gray-600 text-2sm dark:text-gray-400 line-clamp-1">
                                {Array.isArray(historia.diagnosticos)
                                  ? (historia.diagnosticos as any[])
                                      .map(diag =>
                                        typeof diag === 'object' && diag !== null
                                          ? `${diag.codigo} - ${diag.descripcion}`
                                          : String(diag)
                                      )
                                      .join(', ')
                                  : String(historia.diagnosticos)}
                              </p>
                            </div>
                          )}

                          {/* Metadata - Fecha y usuario */}
                          {historia.historialCambios && historia.historialCambios.length > 0 && (
                            <div className="flex items-center gap-3 text-gray-500 text-3xs dark:text-gray-500">
                              <div className="flex items-center gap-1.25">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{historia.historialCambios[0].fecha}</span>
                              </div>
                              <span className="text-gray-400 dark:text-gray-600">•</span>
                              <div className="flex items-center gap-1.25">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium text-gray-600 dark:text-gray-400">{historia.historialCambios[0].usuario}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Columna derecha - Indicadores */}
                        <div className="flex flex-col items-end flex-shrink-0 gap-2">
                          {/* Badge de adjuntos si existen */}
                          {historia.adjuntos && historia.adjuntos.length > 0 && (
                            <div className="flex items-center gap-1.25 px-2.75 py-1 bg-gray-100 dark:bg-coal-500 text-gray-700 dark:text-gray-200 rounded-lg text-3xs font-medium">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span>{historia.adjuntos.length}</span>
                            </div>
                          )}

                          {/* Badge de evoluciones si existen */}
                          {historia.evoluciones && historia.evoluciones.length > 0 && (
                            <div className="flex items-center gap-1.25 px-2.75 py-1 bg-success-light text-success rounded-lg text-3xs font-medium">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              <span>{historia.evoluciones.length} Evoluc.</span>
                            </div>
                          )}

                          {/* Icono de ver más */}
                          <div className="flex items-center justify-center w-8 h-8 mt-2 text-gray-600 transition-all duration-200 bg-gray-100 rounded-lg dark:bg-coal-500 group-hover:bg-primary group-hover:text-primary-inverse dark:text-gray-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra inferior con acceso rápido */}
                    <div className="px-7.5 py-2.75 bg-light-active dark:bg-coal-400 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="font-medium text-gray-600 text-3xs dark:text-gray-400">
                        Click para ver detalles completos
                      </span>
                      <div className="flex items-center gap-1.25 text-3xs text-primary font-medium">
                        <span>Ver más</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>

              {/* Controles de Paginación */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between px-6 py-4 mt-8 border border-gray-200 bg-light dark:bg-coal-300 rounded-xl dark:border-gray-700">
                  {/* Info de resultados */}
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Mostrando <span className="font-semibold text-gray-900 dark:text-gray-100">{indiceInicio + 1}</span> a{' '}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.min(indiceFin, historiasPaciente.length)}</span> de{' '}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{historiasPaciente.length}</span> historias
                  </div>

                  {/* Botones de navegación */}
                  <div className="flex items-center gap-2">
                    {/* Botón Anterior */}
                    <button
                      onClick={paginaAnterior}
                      disabled={paginaActual === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg dark:text-gray-200 bg-light dark:bg-coal-400 dark:border-gray-600 hover:bg-light-active dark:hover:bg-coal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>

                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                        <button
                          key={numero}
                          onClick={() => irAPagina(numero)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                            paginaActual === numero
                              ? 'bg-primary text-primary-inverse'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-coal-500'
                          }`}
                        >
                          {numero}
                        </button>
                      ))}
                    </div>

                    {/* Botón Siguiente */}
                    <button
                      onClick={paginaSiguiente}
                      disabled={paginaActual === totalPaginas}
                      className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg dark:text-gray-200 bg-light dark:bg-coal-400 dark:border-gray-600 hover:bg-light-active dark:hover:bg-coal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* Botón flotante para crear nueva historia si está permitido */}
              {allowCrearHistoria && historiasPaciente.length > 0 && !showForm && (
                <BotonFlotante onClick={handleNuevaHistoria} />
              )}
            </>
          ) : (
            <EmptyState onNuevaHistoria={handleNuevaHistoria} />
          )}

          {/* Modal de detalle */}
          {modalAbierto && historiaSeleccionada && (
            <Modal open={modalAbierto} onClose={handleCerrarModal} zIndex={9999} className="fixed inset-0 flex items-center justify-center min-h-screen">
              <div className="max-w-6xl w-full relative bg-light dark:bg-coal-300 rounded-xl shadow-2xl z-[10000] mx-auto my-auto p-8 border border-gray-200 dark:border-gray-700 transition-colors">
                <button
                  className="absolute z-10 text-gray-400 top-4 right-4 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={handleCerrarModal}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <HistoriaCard
                  historia={historiaSeleccionada}
                  numeroHistoria={historiasPaciente.findIndex(h => h.id === historiaSeleccionada.id) + 1 + ''}
                  cieCatalogo={cieCatalogo}
                  onEditar={() => {
                    handleEditarHistoria(historiaSeleccionada);
                    handleCerrarModal();
                  }}
                  onAdjuntar={(file) => {
                    handleAdjuntarArchivo(historiaSeleccionada.id, file);
                  }}
                  onRegistrarEvolucion={() => {
                    abrirFormEvolucion(historiaSeleccionada.id);
                    setHistoriaSeleccionada(historiaSeleccionada);
                    setModalAbierto(false);
                  }}
                  mostrandoFormEvolucion={!!mostrandoFormEvolucion && historiaSeleccionada?.id === mostrandoFormEvolucion}
                  formEvolucionComponent={null}
                  historialExpandido={false}
                  onToggleHistorial={() => {}}
                  onExportar={() => {
                    const nombrePaciente = paciente.nombre1 + ' ' + (paciente.apellido1 || '');
                    const documentoPaciente = paciente.identificacion;
                    import('./utils/exportarHistoriaPDF').then(({ exportarHistoriaPDF }) => {
                      exportarHistoriaPDF({
                        historia: historiaSeleccionada,
                        nombrePaciente,
                        documentoPaciente,
                        nombreArchivo: `historia-clinica-${historiasPaciente.findIndex(h => h.id === historiaSeleccionada.id) + 1}.pdf`,
                        cieCatalogo // <-- pasar el catálogo aquí
                      });
                    });
                  }}
                  onExportarTratamiento={() => {
                    const nombrePaciente = paciente.nombre1 + ' ' + (paciente.apellido1 || '');
                    const documentoPaciente = paciente.identificacion;
                    import('./utils/exportarHistoriaPDF').then(({ exportarTratamientoPDF }) => {
                      exportarTratamientoPDF({
                        historia: historiaSeleccionada,
                        nombrePaciente,
                        documentoPaciente,
                        nombreArchivo: `tratamiento-${historiasPaciente.findIndex(h => h.id === historiaSeleccionada.id) + 1}.pdf`,
                        cieCatalogo
                      });
                    });
                  }}
                />
              </div>
            </Modal>
          )}
        </div>
        {/* Renderizar formulario de evolucion*/}
        {mostrandoFormEvolucion && historiaSeleccionada && (
          <EvolucionClinicaForm
            onAddEvolucion={handleAgregarEvolucion(historiaSeleccionada.id)}
            responsable={getNombreUsuario()}
          />
        )}
      </div>
    </>
  );
};