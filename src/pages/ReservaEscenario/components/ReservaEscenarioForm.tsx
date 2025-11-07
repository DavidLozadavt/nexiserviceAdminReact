import axios from 'axios';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
// 🚨 Importamos el tipo Agenda, AgendaEscenario para la edición
import { Escenario, ReservaEscenario, ServicioAsociado, TerceroApi, Agenda, AgendaEscenario } from "../typesEscenario";
import { useSnackbar } from 'notistack';
import { formatMinutesToHours } from '../hooks/timeUtils';

import { ClienteNuevo } from '../../GestionReservas/types';
import { RegistroClienteForm } from '../../GestionReservas/components/RegistroClienteForm';

// --- [Funciones de Utilidad] ---

const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]): void => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

// 🚨 TIPO DE UNIÓN: Permite que el escenario sea el objeto completo (Escenario) o el anidado (AgendaEscenario)
type EscenarioFormType = Escenario | AgendaEscenario;

interface ReservaFormData {
    idEscenario: number | null;
    fechaInicio: string;
    fechaFin: string;
    detalle: string;
    idCliente: string; // Se usa para la búsqueda y el input
    idServicio: number | null;
}

interface ClienteEncontradoType {
    id: number;
    identificacion: string;
    nombre: string;
    email: string;
}

interface ReservaEscenarioFormProps {
    fechaSeleccionada: Date;
    escenarios: Escenario[];
    currentCompanyId: number;

    // 🚨 AJUSTE DE TIPO: Aceptar Agenda para edición
    reservaAEditar: Agenda | null; 

    // 🚨 AJUSTE DE TIPO: Aceptar el tipo de unión para escenarios
    escenarioInicial: EscenarioFormType | null; 

    onGuardar: () => void;
    onCancelar: () => void;
}


const formatDateTimeLocal = (date: Date, hours: number = 0, minutes: number = 0): string => {
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString().slice(0, 16);
};
// ---------------------------------


const ReservaEscenarioForm: React.FC<ReservaEscenarioFormProps> = ({
    fechaSeleccionada,
    escenarios = [],
    currentCompanyId,
    reservaAEditar,
    escenarioInicial,
    onGuardar,
    onCancelar,
}) => {

    const { enqueueSnackbar } = useSnackbar();
    // 🚨 DETERMINAR SI ESTAMOS EN MODO EDICIÓN
    const isEditing = !!reservaAEditar;

    // ESTADOS CENTRALES (Mantenidos)
    const [servicioSeleccionado, setServicioSeleccionado] = useState<ServicioAsociado | null>(null);
    const [cargandoServicio, setCargandoServicio] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [errorDisponibilidad, setErrorDisponibilidad] = useState('');
    
    // ESTADOS PARA BÚSQUEDA ROBUSTA
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [cargandoCliente, setCargandoCliente] = useState<boolean>(false);
    const [clienteEncontrado, setClienteEncontrado] = useState<ClienteEncontradoType | null>(null); 
    const [busquedaFallida, setBusquedaFallida] = useState<boolean>(false);
    
    // ESTADOS PARA REGISTRO DE CLIENTE
    const [mostrarRegistroModal, setMostrarRegistroModal] = useState(false);
    const [clienteNuevoData, setClienteNuevoData] = useState<ClienteNuevo>({
       nombre1: '',
    apellido1: '',
    documento: '', 
    celular: '',
    email: '',
    password: '',
    direccion: '',
    identificacion: '', 
    telefono: '', 
    telefonoFijo: '', 
    idTercero: 0,
    });


    const duracionServicioMin = useMemo(() => {
        const defaultDuration = 60;
        const duracionReal = servicioSeleccionado?.tiempoServicio || (servicioSeleccionado as any)?.duracionMin;

        return (typeof duracionReal === 'number' && duracionReal > 0)
            ? duracionReal
            : defaultDuration;

    }, [servicioSeleccionado]);

    // Inicialización del estado del formulario
    const initialEscenarioId = escenarioInicial?.id || (escenarios.length > 0 ? escenarios[0].id : null);

    const [formData, setFormData] = useState<ReservaFormData>(() => {
        
        // 🚨 LÓGICA DE PRECARGA
        if (isEditing && reservaAEditar) {
            const asignacion = reservaAEditar.asignaciones_responsables[0];
            const cliente = asignacion?.cliente;
            const escenario = asignacion?.escenario;

            return {
                idEscenario: escenario?.id || initialEscenarioId,
                // Las agendas usan horaInicial/fechaInicial/Final, que son compatibles con datetime-local
                fechaInicio: `${reservaAEditar.fechaInicial}T${reservaAEditar.horaInicial.substring(0, 5)}`,
                fechaFin: reservaAEditar.horaFinal ? `${reservaAEditar.fechaInicial}T${reservaAEditar.horaFinal.substring(0, 5)}` : '',
                detalle: reservaAEditar.descripcion || '',
                idCliente: cliente?.identificacion || '', // Usar la identificación del cliente
                idServicio: asignacion?.servicio?.id || null,
            };
        }
        
        // LÓGICA DE CREACIÓN
        const defaultStartHour = 9;
        const fechaInicio = formatDateTimeLocal(fechaSeleccionada, defaultStartHour, 0);
        const fechaFinDate = new Date(fechaInicio);
        fechaFinDate.setMinutes(fechaFinDate.getMinutes() + 60);

        return {
            idEscenario: initialEscenarioId,
            fechaInicio,
            fechaFin: fechaFinDate.toISOString().slice(0, 16), 
            detalle: '',
            idCliente: '',
            idServicio: null,
        };
    });


    // 🚨 LÓGICA PARA INICIALIZAR EL CLIENTE Y EL QUERY EN MODO EDICIÓN
    useEffect(() => {
        if (isEditing && reservaAEditar) {
            const asignacion = reservaAEditar.asignaciones_responsables[0];
            const cliente = asignacion?.cliente;
            
            if (cliente) {
                const clienteData: ClienteEncontradoType = {
                    id: cliente.id,
                    identificacion: cliente.identificacion,
                    nombre: cliente.nombre,
                    email: cliente.email || '',
                };
                
                // 1. Pre-llenar el estado del cliente encontrado
                setClienteEncontrado(clienteData);
                
                // 2. Pre-llenar el query de búsqueda
                setSearchQuery(cliente.identificacion); 
            }

            // Si la agenda tiene un idServicio asociado al momento de la edición, úsalo.
            if (formData.idServicio && formData.idServicio !== servicioSeleccionado?.id) {
                // Forzar la carga del servicio si es necesario (ejecutará el useEffect de abajo)
                const servicioCargado = escenarios
                    .find(e => e.id === formData.idEscenario)?.servicio_asignado;
                
                if(servicioCargado) {
                    setServicioSeleccionado(servicioCargado);
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing, reservaAEditar]);


    // Cargar y Sincronizar el Servicio (Se ajusta para no sobrescribir en edición)
    useEffect(() => {
        const idEscenarioActual = formData.idEscenario;

        if (!idEscenarioActual) {
            setServicioSeleccionado(null);
            setFormData(prev => ({ ...prev, idServicio: null }));
            return;
        }

        setCargandoServicio(true);
        // NO reseteamos servicioSeleccionado aquí para no causar flicker en edición
        // setServicioSeleccionado(null);

        const cargarServicioAsociado = async () => {
            try {
                const response = await axios.get(`get_services_by_escenario/${idEscenarioActual}`);
                const servicios = response.data as ServicioAsociado[];

                if (Array.isArray(servicios) && servicios.length > 0) {
                    const servicio = servicios[0];
                    setServicioSeleccionado(servicio);

                    setFormData(prev => {
                        // 🚨 MODO EDICIÓN: NO SOBREESCRIBIR LA FECHA DE FIN si no se cambió la hora de inicio
                        if (isEditing && reservaAEditar && prev.fechaFin && prev.fechaFin.length > 0) {
                             return { ...prev, idServicio: servicio.id };
                        }
                        
                        // MODO CREACIÓN o CAMBIO DE ESCENARIO: Calcular nueva fecha fin
                        const newDuracion = servicio.tiempoServicio || (servicio as any).duracionMin || 60;
                        const newStartDate = new Date(prev.fechaInicio);
                        newStartDate.setMinutes(newStartDate.getMinutes() + newDuracion);

                        return {
                            ...prev,
                            idServicio: servicio.id, 
                            fechaFin: newStartDate.toISOString().slice(0, 16),
                        };
                    });

                } else {
                    setServicioSeleccionado(null);
                    setFormData(prev => ({ ...prev, idServicio: null }));
                    enqueueSnackbar('El escenario no tiene servicios asignados.', { variant: 'warning' });
                }
            } catch (error) {
                console.error("Error cargando servicio asociado:", error);
                setServicioSeleccionado(null);
                setFormData(prev => ({ ...prev, idServicio: null }));
                enqueueSnackbar('Error al cargar la información del servicio.', { variant: 'error' });
            } finally {
                setCargandoServicio(false);
            }
        };

        cargarServicioAsociado();
    }, [formData.idEscenario, enqueueSnackbar, isEditing, reservaAEditar]);


    // --- Handlers de Interacción ---

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newFormData = {
                ...prev,
                [name]: name === 'idEscenario' || name === 'idServicio' ? parseInt(value) || null : value
            };

            // Recalcular fechaFin solo si se cambia la fechaInicio
            if (name === 'fechaInicio') {
                const newStartDate = new Date(newFormData.fechaInicio);
                newStartDate.setMinutes(newStartDate.getMinutes() + duracionServicioMin);
                newFormData.fechaFin = newStartDate.toISOString().slice(0, 16);
            }

            return newFormData;
        });

        setErrorDisponibilidad('');
    }, [duracionServicioMin]);

    // 💡 LÓGICA DE BÚSQUEDA (Mantenida, pero con tipo clienteEncontrado definido)
    const performSearch = async (query: string): Promise<ClienteEncontradoType | null> => {
        if (!query || query.length < 5) {
            setClienteEncontrado(null);
            setBusquedaFallida(false);
            return null;
        }

        setCargandoCliente(true);
        setBusquedaFallida(false);

        const isCC = /^\d+$/.test(query) && query.length >= 6;
        const url = isCC
           ? `terceros_by_cc/${query}`      
        : `terceros_by_telefono/${query}`;

        try {
            const response = await axios.get<TerceroApi>(url);
            const tercero = response.data;

            if (tercero && tercero.id) {
                const clienteFinal: ClienteEncontradoType = {
                    id: tercero.id,
                    identificacion: tercero.identificacion,
                    nombre: tercero.nombre || `${tercero.nombre1 || ''} ${tercero.apellido1 || ''}`.trim(),
                    email: tercero.email || '',
                };

                setClienteEncontrado(clienteFinal);
                enqueueSnackbar('Cliente encontrado.', { variant: 'success' });

              setFormData(prev => ({ 
                ...prev, 
                idCliente: tercero.identificacion 
            }));

            return clienteFinal;

            } else {
                setClienteEncontrado(null);
                setBusquedaFallida(true);
                setFormData(prev => ({ ...prev, idCliente: '' }));
                return null;
            }
        } catch (error) {
        setClienteEncontrado(null);
        setBusquedaFallida(true);
        setFormData(prev => ({ ...prev, idCliente: '' }));
        if (axios.isAxiosError(error) && error.response?.status === 404) {
             console.log(`Cliente no encontrado para el query: ${query}`);
        } else {
             console.error("Error en la búsqueda de cliente:", error);
        }
        return null;
    } finally {
        setCargandoCliente(false);
    }
};

    const debouncedSearch = useCallback(debounce((query: string) => {
        if (query.length >= 5) {
            performSearch(query);
        }
    }, 500), [enqueueSnackbar]); 

    // Lógica de registro de cliente (Mantenida)
    const handleRegistroCliente = () => {
        setClienteNuevoData(prev => ({ 
            ...prev, 
            documento: searchQuery, 
            password: '', 
            nombre1: '', 
            apellido1: '',
            email: '',
            celular: '',
            direccion: '',
        }));
        setMostrarRegistroModal(true);
    };

    const handleNuevoClienteChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setClienteNuevoData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleConfirmRegistro = async () => {
        // ... (Lógica de confirmación de registro)
        if (!clienteNuevoData.documento || !clienteNuevoData.nombre1 || !clienteNuevoData.apellido1 || !clienteNuevoData.password || !clienteNuevoData.celular || !clienteNuevoData.direccion) {
            enqueueSnackbar('Complete Primer Nombre, Apellido, Documento, Teléfono, Dirección y Contraseña.', { variant: 'warning' });
            return;
        }
        if (clienteNuevoData.password.length < 6) {
            enqueueSnackbar('La contraseña debe tener al menos 6 caracteres.', { variant: 'warning' });
            return;
        }

        setCargando(true);

        const dataAPI = {
            email: clienteNuevoData.email,
            password: clienteNuevoData.password,
            identificacion: clienteNuevoData.documento, 
            nombre1: clienteNuevoData.nombre1,
            apellido1: clienteNuevoData.apellido1,
            telefono: clienteNuevoData.celular,
            direccion: clienteNuevoData.direccion,
        };

        try {
            await axios.post('register_web', dataAPI); 
            
            const clienteFinal = await performSearch(clienteNuevoData.documento);

            if (clienteFinal && clienteFinal.id) {
                enqueueSnackbar('Cliente registrado y seleccionado con éxito.', { variant: 'success' });
                setMostrarRegistroModal(false); 
                setBusquedaFallida(false); 
            } else {
                enqueueSnackbar('Cliente registrado, pero no se pudo seleccionar automáticamente. Busque de nuevo.', { variant: 'warning' });
                setMostrarRegistroModal(false);
            }

        } catch (error) {
            let apiError = 'Error desconocido al registrar el cliente.';
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                if (responseData.error) {
                    apiError = responseData.error;
                } else if (responseData.errors) {
                    apiError = Object.values(responseData.errors).flat().join(' ');
                } else {
                    apiError = responseData.message || apiError;
                }
            }
            enqueueSnackbar(`Error de registro: ${apiError}`, { variant: 'error' });
        } finally {
            setCargando(false);
        }
    };


    // Manejo de Submit (Ajustado para el PUT en edición)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // VALIDACIONES (Mantienen)
        if (cargando || cargandoServicio || !formData.idEscenario || !formData.idServicio || !clienteEncontrado) {
            enqueueSnackbar('Asegúrate de seleccionar un escenario, tener un servicio asociado y validar un cliente.', { variant: 'warning' });
            return;
        }

        setCargando(true);
        setErrorDisponibilidad('');

        const fechaInicio = new Date(formData.fechaInicio);
        const fechaFin = new Date(formData.fechaFin);

        if (fechaFin <= fechaInicio) {
            enqueueSnackbar('La hora de fin debe ser posterior a la de inicio.', { variant: 'warning' });
            setCargando(false);
            return;
        }

        // Permitimos la edición de reservas pasadas, pero no la creación
        if (fechaInicio < new Date() && !isEditing) {
            enqueueSnackbar('No se pueden crear reservas en el pasado.', { variant: 'warning' });
            setCargando(false);
            return;
        }
     
        // Preparamos los datos
        const [fechaParte, horaParte] = formData.fechaInicio.split('T'); // "2025-11-04T14:00" -> ["2025-11-04", "14:00"]
        const finalData = {
            ...formData,
           date: fechaParte,           
            time: horaParte,           
            idServicio: formData.idServicio,   
            idTercero: clienteEncontrado.id,   
            idEscenario: formData.idEscenario, 
            comentario: formData.detalle,    
            idCompany: currentCompanyId,
            
            // 🚨 AJUSTE PARA EDICIÓN: Pasar el ID de la agenda/reserva
            ...(isEditing && { idAgenda: reservaAEditar!.id })
        };

        //  Llamada al API para Guardar
        try {
            let response;
            if (isEditing) {
                // Endpoint para ACTUALIZACIÓN de agenda
                response = await axios.put(`/api/update_agenda_escenario/${reservaAEditar!.id}`, finalData);
            } else {
                // Endpoint para CREACIÓN de agenda
                response = await axios.post('/gestion_agendas_escenario', finalData);            }

            enqueueSnackbar(`Reserva ${isEditing ? 'actualizada' : 'creada'} con éxito!`, { variant: 'success' });
            onGuardar();

        } catch (error) {
            let apiError = 'Error desconocido al guardar la reserva.';
            if (axios.isAxiosError(error) && error.response) {
                apiError = error.response.data.message || apiError;
            } else if (error instanceof Error) {
                apiError = error.message;
            }
            enqueueSnackbar(`Error: ${apiError}`, { variant: 'error' });
        } finally {
            setCargando(false);
        }
    };

    // Encuentra el escenario actualmente seleccionado en el form 
    const currentEscenario = useMemo(() => {
        return escenarios.find(e => e.id === formData.idEscenario) || null;
    }, [escenarios, formData.idEscenario]);

   

    return (
        // 💡 4. RENDERIZADO DEL FORMULARIO Y EL MODAL (Sin cambios, ya maneja isEditing)
        <>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <h3 className="mb-4 text-xl font-bold text-gray-800">
                </h3>

                {/* CONTENEDOR SCROLLABLE */}
                <div className="flex-grow pr-8 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">

                    {/* ... (SECCIÓN 1: ESCENARIO SELECCIONADO) ... */}
                    <div className="space-y-2">
                        <h3 className="pb-2 font-semibold text-gray-800 border-b border-gray-200 text-md">
                            Seleccionar Escenario
                        </h3>

                        <select
                            name="idEscenario"
                            value={formData.idEscenario || ''}
                            onChange={handleChange}
                            className="w-full py-2 pl-3 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-100"
                            // 🚨 Deshabilitar si estamos editando y el escenario es crucial para la reserva
                            disabled={isEditing || cargando} 
                        >
                            <option value="">Selecciona un escenario</option>
                            {escenarios.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.nombre}
                                </option>
                            ))}
                        </select>

                        {formData.idEscenario && (
                            <div className="flex items-center mt-2 space-x-2">
                                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-primary">
                                    {currentEscenario?.imagenUrl ? (
                                        <img
                                            src={currentEscenario.imagenUrl}
                                            alt="Escenario"
                                            className="object-cover w-full h-full rounded-full"
                                        />
                                    ) : (
                                        <span>🏟️</span>
                                    )}
                                </div>
                                <span className="font-bold text-gray-800">{currentEscenario?.nombre}</span>
                            </div>
                        )}
                    </div>


                    {/* SECCIÓN 2: DATOS DEL CLIENTE */}
                    <div className="space-y-4">
                        <h3 className="pb-2 font-semibold text-gray-800 border-b border-gray-200 text-md">
                            Datos del Cliente
                        </h3>

                        {clienteEncontrado && (
                            <div className="p-2 text-sm rounded-lg text-success-inverse bg-success">
                                Cliente: <strong>{clienteEncontrado.nombre}</strong> ({clienteEncontrado.identificacion})
                            </div>
                        )}


                        <div className="flex space-x-2">
                            <div className="flex-grow">
                                <label htmlFor="searchQuery" className="sr-only">Identificación o Teléfono del Cliente</label>
                                <input
                                    type="text"
                                    id="searchQuery"
                                    name="searchQuery"
                                    placeholder="Identificación del Cliente"
                                    value={searchQuery}
                                onChange={(e) => {
                                    const query = e.target.value;
                                    setSearchQuery(query);
                                
                                    if (query.length < 5) {
                                        setClienteEncontrado(null);
                                        setBusquedaFallida(false);
                                        setFormData(prev => ({ ...prev, idCliente: '' }));
                                    }
                                    // 🚨 Solo buscar si no estamos en modo edición o si la búsqueda cambia el ID
                                    if(!isEditing || query !== clienteEncontrado?.identificacion) {
                                        debouncedSearch(query);
                                    }
                                }}
                                required
                                className="w-full py-2 pl-3 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-100"
                                disabled={cargando} 
                            />
                                {/* Indicador de carga */}
                                {cargandoCliente && <p className="mt-1 text-sm text-indigo-600">Buscando...</p>}
                            </div>

                        
                        </div>

                        {/* Mensaje de cliente no encontrado (con botón que abre el modal) */}
                        {busquedaFallida && !clienteEncontrado && searchQuery.length >= 5 && (
                            <div className="p-2 text-sm text-red-700 border border-red-300 rounded-lg bg-red-50">
                                <p className="font-semibold">Cliente no encontrado.</p>
                                <button type="button" onClick={handleRegistroCliente} className="mt-1 text-blue-600 underline">
                                    Registrar Nuevo Cliente
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ... (SECCIÓN 3: DETALLES DEL SERVICIO) ... */}
                    <div className="space-y-4">
                        <h3 className="pb-2 font-semibold text-gray-800 border-b border-gray-200 text-md">
                            Detalles del Servicio
                        </h3>

                        {/* SERVICIO CARGADO DINÁMICAMENTE */}
                        <div>
                            <label htmlFor="servicio" className="block text-sm font-medium text-gray-700">Servicio</label>
                            <p className={`mt-1 p-2 rounded-lg text-gray-800 border ${cargandoServicio ? 'bg-yellow-100 animate-pulse' : 'bg-gray-100'}`}>
                                {cargandoServicio ? (
                                    'Cargando servicio asociado...'
                                ) : servicioSeleccionado ? (
                                    <>
                                        <strong>{servicioSeleccionado.nombre}</strong><br />
                                        {servicioSeleccionado.precio && `${servicioSeleccionado.precio} COP`}
                                    </>
                                ) : (
                                    'Servicio no asignado al escenario'
                                )}
                            </p>

                            <input type="hidden" name="idServicio" value={formData.idServicio || ''} />
                        </div>

                        {/* TIEMPO DE SERVICIO  */}
                        <div>
                            <label htmlFor="tiempoServicio" className="block text-sm font-medium text-gray-700">Tiempo de Servicio</label>
                            <div className="flex items-center p-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg">
                                <span className="mr-2 text-xl">⏱️</span>
                            <span>
                                    {cargandoServicio 
                                        ? 'Cargando...' 
                                        : (
                                            <strong>{formatMinutesToHours(duracionServicioMin)}</strong>
                                        )}
                                    
                                </span>
                            </div>
                        </div>

                        {/* FECHA Y HORA */}
                        <div>
                            <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
                                Inicio <span className="text-danger">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                id="fechaInicio"
                                name="fechaInicio"
                                value={formData.fechaInicio}
                                onChange={handleChange}
                                required
                                className="block w-full mt-1 border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-100"
                                disabled={cargando}
                            />
                        </div>

                        {/* Detalle / Notas */}
                        <div>
                            <label htmlFor="detalle" className="block text-sm font-medium text-gray-700">
                                Detalles de la Reserva (Opcional)
                            </label>
                            <textarea
                                id="detalle"
                                name="detalle"
                                rows={5} /* Actualmente está en 2 */
                                value={formData.detalle}
                                onChange={handleChange}
                                className="block w-full mt-1 border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-100"
                                disabled={cargando}
                            />
                        </div>
                    </div>

                    {/* MENSAJE DE DISPONIBILIDAD/ERROR */}
                    {errorDisponibilidad && (
                        <p className="p-2 text-sm rounded-lg text-danger-inverse bg-danger">
                            ⚠️ {errorDisponibilidad}
                        </p>
                    )}
                </div>
                {/* FIN CONTENEDOR SCROLLABLE */}

                {/* FOOTER (Fijo) */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                    {/* BOTONES DE ACCIÓN */}
                    <div className="flex justify-center space-x-3">
                        <button
                            type="button"
                            onClick={onCancelar}
                            disabled={cargando}
                            className="text-white bg-red-500 hover:bg-red-800 btn btn-secundary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            // Deshabilitar si está cargando el servicio, o si falta servicio o cliente
                            disabled={cargando || cargandoServicio || !formData.idServicio || !clienteEncontrado}
                            className="btn btn-primary"
                        >
                            {cargando ? 'Guardando...' : isEditing ? 'Modificar Reserva' : 'Crear Reserva'}
                        </button>
                    </div>

                    
                </div>
            </form>

            {/* 💡 RENDERIZADO DEL MODAL DE REGISTRO */}
            {mostrarRegistroModal && (
                <RegistroClienteForm
                    clienteNuevo={clienteNuevoData}
                    handleNuevoClienteChange={handleNuevoClienteChange}
                    onClose={() => setMostrarRegistroModal(false)}
                    onConfirm={handleConfirmRegistro}
                />
            )}
        </>
    );
};

export default ReservaEscenarioForm;