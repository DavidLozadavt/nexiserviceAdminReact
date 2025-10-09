import React, { useState } from 'react';
import { useAuthContext } from '@/auth/useAuthContext';
import { HistoriaClinica } from './types';
import { Paciente } from '../gestion-pacientes/types';
import { HistoriaClinicaForm } from './HistoriaClinicaForm';
import { v4 as uuidv4 } from 'uuid';
import EvolucionClinicaForm from '../evoluciones/EvolucionClinicaForm';

import { EvolucionClinica } from './types';

interface GestionHistoriasProps {
  paciente: Paciente;
  onClose?: () => void;
  setHistoriasPaciente?: (historias: HistoriaClinica[]) => void;
}

const historiasMock: HistoriaClinica[] = [];

export const GestionHistorias: React.FC<GestionHistoriasProps> = ({ paciente, onClose, setHistoriasPaciente }) => {
  const [historias, setHistorias] = useState<HistoriaClinica[]>(historiasMock);
  const [showForm, setShowForm] = useState(false);
  const [historiaEditando, setHistoriaEditando] = useState<HistoriaClinica | null>(null);
  const [historialExpandido, setHistorialExpandido] = useState<{ [key: string]: boolean }>({});
  const [mostrandoFormEvolucion, setMostrandoFormEvolucion] = useState<string | null>(null);
  const { user } = useAuthContext();

  const historiasPaciente = React.useMemo(() => historias.filter(h => h.pacienteId === paciente.id), [historias, paciente.id]);

  const actualizarHistoriasPaciente = React.useCallback(() => {
    if (setHistoriasPaciente) {
      console.log('Actualizando historias del paciente');
      setHistoriasPaciente(historiasPaciente);
    }
  }, [historiasPaciente, setHistoriasPaciente]);

  React.useEffect(() => {
    actualizarHistoriasPaciente();
  }, [actualizarHistoriasPaciente]);

  const handleGuardarHistoria = (historia: HistoriaClinica) => {
    const now = new Date();
    const fechaActual = now.toLocaleString();
    const usuarioActual = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'Desconocido';

    if (historiaEditando) {
      setHistorias(historias.map(h =>
        h.id === historiaEditando.id
          ? {
              ...historia,
              pacienteId: paciente.id,
              id: historiaEditando.id,
              historialCambios: [
                ...(h.historialCambios || []),
                {
                  fecha: fechaActual,
                  usuario: usuarioActual,
                  motivo: 'Edición de historia clínica',
                },
              ],
              fechaCreacion: h.fechaCreacion,
              adjuntos: historia.adjuntos || [],
            }
          : h
      ));
    } else {
      setHistorias([
        ...historias,
        {
          ...historia,
          pacienteId: paciente.id,
          id: historia.id || (Math.random() + '').slice(2),
          fechaCreacion: fechaActual,
          historialCambios: [
            {
              fecha: fechaActual,
              usuario: usuarioActual,
              motivo: 'Creación de historia clínica',
            },
          ],
          adjuntos: historia.adjuntos || [],
        },
      ]);
    }
    setShowForm(false);
    setHistoriaEditando(null);
  };

  // Adjuntar archivo a una historia clínica
  const handleAdjuntarArchivo = async (historiaId: string, file: File) => {
    const url = URL.createObjectURL(file);
    const adjunto = {
      id: uuidv4(),
      nombre: file.name,
      url,
      tipo: file.type,
    };
    setHistorias(historias =>
      historias.map(h =>
        h.id === historiaId
          ? { ...h, adjuntos: [...(h.adjuntos || []), adjunto] }
          : h
      )
    );
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'medica':
        return 'bg-primary-light text-primary border-primary';
      case 'fisioterapia':
        return 'bg-info-light text-info border-info';
      case 'odontologica':
        return 'bg-warning-light text-warning border-warning';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'medica':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'fisioterapia':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'odontologica':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 015 0H17" />
          </svg>
        );
      default:
        return null;
    }
  };


  const handleAddEvolucion = (historiaId: string, nuevaEvolucion: EvolucionClinica) => {
    setHistorias(historias =>
      historias.map(h =>
        h.id === historiaId
          ? { ...h, evoluciones: [nuevaEvolucion, ...(h.evoluciones || [])] }
          : h
      )
    );
  };

  const toggleHistorial = (historiaId: string) => {
    setHistorialExpandido(prev => ({
      ...prev,
      [historiaId]: !prev[historiaId]
    }));
  };

  
const MenuAcciones = ({ 
  historiaId,
  onEditar, 
  onAdjuntar, 
  onRegistrarEvolucion 
}: { 
  historiaId: string;
  onEditar: () => void;
  onAdjuntar: (file: File) => void;
  onRegistrarEvolucion: () => void;
}) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleToggleMenu = () => {
    console.log('Menu toggle clicked');
    setMenuAbierto(!menuAbierto);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleMenu}
        className="btn btn-sm bg-primary hover:bg-primary-active text-white px-4 py-2 rounded-lg transition-all duration-200 text-2xs font-medium flex items-center"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        Acciones
        <svg className={`w-4 h-4 ml-1.5 transition-transform duration-200 ${menuAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 ${menuAbierto ? 'block' : 'hidden'}`}>
        <button
          onClick={() => {
            onEditar();
            setMenuAbierto(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar Historia
        </button>

        <button
          onClick={() => {
            fileInputRef.current?.click();
            setMenuAbierto(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Adjuntar Archivo
        </button>

        <button
          onClick={() => {
            onRegistrarEvolucion();
            setMenuAbierto(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Registrar Evolución
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onAdjuntar(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

  const [proximasCitas, setProximasCitas] = useState<Array<{ pacienteNombre: string; fecha: string }>>([]);

  // Buscar próximas citas (un día antes)
  React.useEffect(() => {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    const yyyy = manana.getFullYear();
    const mm = String(manana.getMonth() + 1).padStart(2, '0');
    const dd = String(manana.getDate()).padStart(2, '0');
    const fechaManana = `${yyyy}-${mm}-${dd}`;

    // Buscar evoluciones con próxima cita igual a mañana
    const evoluciones = historias
      .filter(h => h.pacienteId === paciente.id)
      .flatMap(h => h.evoluciones?.filter(e => !!e.proximaCita).map(e => ({
        pacienteNombre: paciente.nombreCompleto,
        fecha: e.proximaCita as string
      })) || []);
    const citas = evoluciones.filter(e => e.fecha === fechaManana);
    setProximasCitas(citas);
  }, [historias, paciente]);


  return (
    <>
      {/* Alerta visual para próximas citas */}
      {proximasCitas.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <strong>Recordatorio:</strong> Tienes citas próximas mañana:
          <ul className="mt-2 list-disc list-inside">
            {proximasCitas.map((cita, idx) => (
              <li key={idx}>
                Paciente: <span className="font-semibold">{cita.pacienteNombre}</span> — Fecha: <span className="font-semibold">{cita.fecha}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-xs text-gray-600">(Simulación: aquí se enviaría el correo al paciente)</div>
        </div>
      )}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Información del Paciente */}
          <div className="card bg-white shadow-card border border-gray-200 rounded-xl mb-8 overflow-hidden">
            <div className="px-7.5 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2.5xl font-bold text-gray-900 mb-1">
                      {paciente.nombreCompleto}
                    </h1>
                    <div className="flex items-center text-md text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 118 0v2m-4 0a2 2 0 104 0m-4 0a2 2 0 014 0z" />
                      </svg>
                      {paciente.tipoIdentificacion} {paciente.identificacion}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {onClose && (
                    <button 
                      onClick={onClose}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      title="Cerrar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {!showForm && (
                    <button
                      className="btn btn-lg bg-primary hover:bg-primary-active text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-primary"
                      onClick={() => {
                        setShowForm(true);
                        setHistoriaEditando(null);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Nueva Historia
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          {showForm && (
            <div className="mb-8">
              <HistoriaClinicaForm
                historiaExistente={historiaEditando ?? undefined}
                onGuardar={handleGuardarHistoria}
                onCancelar={() => {
                  setShowForm(false);
                  setHistoriaEditando(null);
                }}
              />
            </div>
          )}

          {historiasPaciente.length > 0 ? (
            <div className="space-y-6">
              {historiasPaciente.map((historia, idx) => {
                const numeroHistoria = (idx + 1).toString().padStart(2, '0');
                return (
                  <div key={historia.id} className="card bg-white shadow-card border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-7.5 py-5 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-3xs font-medium border ${getTipoColor(historia.tipo)} mr-4`}>
                            {getTipoIcon(historia.tipo)}
                            <span className="ml-1.5 capitalize">{historia.tipo}</span>
                          </div>
                          <div>
                            <h3 className="text-1.5xl font-semibold text-gray-900">
                              Historia Clínica #{numeroHistoria}
                            </h3>
                            {/* Mostrar usuario responsable y fecha de creación */}
                            {historia.historialCambios && historia.historialCambios.length > 0 && (
                              <div className="text-2sm text-gray-600">
                                Creada el {historia.historialCambios[0].fecha} por <span className="font-semibold">{historia.historialCambios[0].usuario}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <MenuAcciones
                          historiaId={historia.id}
                          onEditar={() => {
                            setHistoriaEditando(historia);
                            setShowForm(true);
                          }}
                          onAdjuntar={(file) => handleAdjuntarArchivo(historia.id, file)}
                          onRegistrarEvolucion={() => setMostrandoFormEvolucion(historia.id)}
                        />
                      </div>
                    </div>
                    <div className="px-7.5 py-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-2sm font-medium text-gray-700 mb-2">Motivo de Consulta</h4>
                          <p className="text-2sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {historia.motivoConsulta}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-2sm font-medium text-gray-700 mb-2">Diagnóstico</h4>
                          <p className="text-2sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {historia.diagnostico}
                          </p>
                        </div>
                        <div className="lg:col-span-2">
                          <h4 className="text-2sm font-medium text-gray-700 mb-2">Tratamiento</h4>
                          <p className="text-2sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {historia.tratamiento}
                          </p>
                        </div>
                        {historia.observaciones && (
                          <div className="lg:col-span-2">
                            <h4 className="text-2sm font-medium text-gray-700 mb-2">Observaciones</h4>
                            <p className="text-2sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                              {historia.observaciones}
                            </p>
                          </div>
                        )}
                      </div>

                      {mostrandoFormEvolucion === historia.id && (
                        <div className="mt-8">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-2sm font-semibold text-gray-900">Registrar Evolución Clínica</h4>
                              <button
                                onClick={() => setMostrandoFormEvolucion(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <EvolucionClinicaForm
                              onAddEvolucion={evolucion => {
                                handleAddEvolucion(historia.id, evolucion);
                                setMostrandoFormEvolucion(null);
                              }}
                              responsable={user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'Desconocido'}
                            />
                          </div>
                        </div>
                      )}

                      {historia.evoluciones && historia.evoluciones.length > 0 && (
                        <div className="mt-8">
                          <h4 className="text-2sm font-semibold text-gray-900 mb-2">Evoluciones Clínicas</h4>
                          <div className="space-y-4">
                            {historia.evoluciones
                              .slice()
                              .sort((a, b) => b.fecha.localeCompare(a.fecha))
                              .map(evolucion => (
                                <div key={evolucion.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-2sm font-medium text-gray-800">{evolucion.fecha}</span>
                                    <span className="text-3xs text-gray-500">{evolucion.responsable}</span>
                                  </div>
                                  <div className="text-2sm text-gray-900 mb-2">{evolucion.descripcion}</div>
                                  {evolucion.firmaDigital && (
                                    <div className="mt-2">
                                      <span className="text-3xs text-gray-600">Firma digital:</span>
                                      <img src={evolucion.firmaDigital} alt="Firma digital" className="max-h-20 mt-1" />
                                    </div>
                                  )}
                                  {evolucion.proximaCita && (
                                    <div className="mt-2 text-3xs text-info">
                                      <strong>Próxima cita:</strong> {evolucion.proximaCita}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {historia.adjuntos && historia.adjuntos.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="text-2sm font-semibold text-gray-900 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            Archivos Adjuntos
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {historia.adjuntos.map(a => (
                              <a 
                                key={a.id}
                                href={a.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
                              >
                                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-clarity transition-colors">
                                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-2sm font-medium text-gray-900 truncate">{a.nombre}</p>
                                  <p className="text-3xs text-gray-500">{a.tipo || 'Archivo'}</p>
                                </div>
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {historia.historialCambios && historia.historialCambios.length > 1 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <button
                            onClick={() => toggleHistorial(historia.id)}
                            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
                          >
                            <h4 className="text-2sm font-semibold text-gray-900 flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Historial de Cambios
                              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-3xs font-medium rounded-full">
                                {historia.historialCambios.length - 1}
                              </span>
                            </h4>
                            <svg 
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${historialExpandido[historia.id] ? 'rotate-180' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {historialExpandido[historia.id] && (
                            <div className="mt-3 space-y-3 pl-3">
                              {historia.historialCambios.slice(1).map((cambio, idx) => (
                                <div key={idx} className="flex items-start">
                                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3"></div>
                                  <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                                    <p className="text-2sm text-gray-900 font-medium">{cambio.motivo}</p>
                                    <div className="flex items-center mt-1 text-3xs text-gray-600">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {cambio.fecha}
                                      <span className="mx-2">•</span>
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      <span className="font-semibold">{cambio.usuario}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card bg-white shadow-card border border-gray-200 rounded-xl">
              <div className="px-7.5 py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-1.5xl font-semibold text-gray-900 mb-2">
                  No hay historias clínicas
                </h3>
                <p className="text-2sm text-gray-600 mb-6">
                  Este paciente no tiene historias clínicas registradas. Crea la primera historia clínica.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};