import axios from 'axios';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Escenario, ReservaEscenario, ServicioAsociado, TerceroApi } from "../typesEscenario";
import { useSnackbar } from 'notistack';

const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]): void => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};
interface ReservaFormData {
    idEscenario: number | null;
    fechaInicio: string;
    fechaFin: string;
    detalle: string;
    idCliente: string;
    idServicio: number | null;
}

interface ReservaEscenarioFormProps {
    fechaSeleccionada: Date;
    escenarios: Escenario[];
    currentCompanyId: number;

    reservaAEditar: (ReservaEscenario & { detalle: string }) | null;
    escenarioInicial: Escenario | null;

    onGuardar: () => void;
    onCancelar: () => void;
}

// --- 2. FUNCIONES DE UTILIDAD ---

const formatDateTimeLocal = (date: Date, hours: number = 0, minutes: number = 0): string => {
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString().slice(0, 16);
};

// --- 3. COMPONENTE PRINCIPAL ---

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
    const isEditing = !!reservaAEditar;

    // ESTADOS CENTRALES
    const [servicioSeleccionado, setServicioSeleccionado] = useState<ServicioAsociado | null>(null);
    const [cargandoServicio, setCargandoServicio] = useState(false);

    const [cargando, setCargando] = useState(false);
    const [errorDisponibilidad, setErrorDisponibilidad] = useState('');
    // ESTADOS PARA BÚSQUEDA ROBUSTA:
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [cargandoCliente, setCargandoCliente] = useState<boolean>(false);
    const [clienteEncontrado, setClienteEncontrado] = useState<any>(null); // Mantendremos 'clienteEncontrado'
    const [busquedaFallida, setBusquedaFallida] = useState<boolean>(false);
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
        const defaultStartHour = 9;
        const fechaInicio = formatDateTimeLocal(fechaSeleccionada, defaultStartHour, 0);

        // Calculamos la fechaFin inicial (requerida para el backend)
        const fechaFinDate = new Date(fechaInicio);
        fechaFinDate.setMinutes(fechaFinDate.getMinutes() + 60);
        const fechaFin = fechaFinDate.toISOString().slice(0, 16);

        return {
            idEscenario: initialEscenarioId,
            fechaInicio,
            fechaFin, // Se inicializa para el backend
            detalle: reservaAEditar?.detalle || '',
            idCliente: '',
            idServicio: reservaAEditar?.idServicio || null,
        };
    });


    // 🎯 EFECTO CENTRAL: Cargar y Sincronizar el Servicio
    useEffect(() => {
        const idEscenarioActual = formData.idEscenario;

        if (!idEscenarioActual) {
            setServicioSeleccionado(null);
            setFormData(prev => ({ ...prev, idServicio: null }));
            return;
        }

        setCargandoServicio(true);
        setServicioSeleccionado(null);

        const cargarServicioAsociado = async () => {
            try {
                const response = await axios.get(`get_services_by_escenario/${idEscenarioActual}`);
                const servicios = response.data as ServicioAsociado[];

                if (Array.isArray(servicios) && servicios.length > 0) {
                    const servicio = servicios[0];

                    setServicioSeleccionado(servicio);

                    setFormData(prev => {
                        const newDuracion = servicio.tiempoServicio || (servicio as any).duracionMin || 60;
                        const newStartDate = new Date(prev.fechaInicio);
                        // Calculamos la nueva fecha de fin (REQUERIDO PARA EL BACKEND)
                        newStartDate.setMinutes(newStartDate.getMinutes() + newDuracion);

                        return {
                            ...prev,
                            idServicio: servicio.id, // Sincroniza el ID del servicio
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
    }, [formData.idEscenario, enqueueSnackbar]);


    // --- Handlers de Interacción ---

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newFormData = {
                ...prev,
                // Parseo de ID solo para idEscenario e idServicio
                [name]: name === 'idEscenario' || name === 'idServicio' ? parseInt(value) || null : value
            };

            // Si cambias la fecha/hora de inicio, actualiza la fecha de fin manteniendo la duración
            if (name === 'fechaInicio') {
                const newStartDate = new Date(newFormData.fechaInicio);
                newStartDate.setMinutes(newStartDate.getMinutes() + duracionServicioMin);
                newFormData.fechaFin = newStartDate.toISOString().slice(0, 16);
            }

            return newFormData;
        });

        setErrorDisponibilidad('');
    }, [duracionServicioMin]);

    // Lógica para el botón "Nuevo" o Buscar Cliente
    const performSearch = async (query: string): Promise<any | null> => {
        if (!query || query.length < 5) {
            setClienteEncontrado(null);
            setBusquedaFallida(false);
            return null;
        }

        setCargandoCliente(true);
        setBusquedaFallida(false);

        // Determina si es CC (cédula) o Teléfono
const isCC = /^\d+$/.test(query) && query.length >= 6;

const url = isCC
           ? `terceros_by_cc/${query}`      
        : `terceros_by_telefono/${query}`;

        try {
            const response = await axios.get<TerceroApi>(url);
            const tercero = response.data;

            if (tercero && tercero.id) {
                // Adaptar la estructura al formato que usa tu formulario
                const clienteFinal = {
                    id: tercero.id,
                    identificacion: tercero.identificacion,
                    nombre: tercero.nombre || `${tercero.nombre1 || ''} ${tercero.apellido1 || ''}`.trim(),
                    email: tercero.email || '',
                    // ... (otros campos necesarios)
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
        // Manejo de error (ej: respuesta 404, 500 o fallo de conexión)
        setClienteEncontrado(null);
        setBusquedaFallida(true);
        setFormData(prev => ({ ...prev, idCliente: '' }));
        // Si es 404, es la razón principal de la búsqueda fallida
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
        // Solo si el query es lo suficientemente largo
        if (query.length >= 5) {
            performSearch(query);
        }
    }, 500), [enqueueSnackbar]); // La dependencia enqueueSnackbar evita el warning

    // Función de registro (simplemente abre el modal/modo registro si fuera necesario)
    const handleRegistroCliente = () => {
        // Aquí pondrías la lógica para abrir tu modal/componente de Registro
        enqueueSnackbar('Cliente no encontrado. Listo para registrar uno nuevo.', { variant: 'info' });
    };


    // --- Lógica de Disponibilidad ---

    const verificarDisponibilidad = async (data: ReservaFormData): Promise<boolean> => {
        if (!data.idEscenario) return false;

        try {
            const payload = {
                idEscenario: data.idEscenario,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                excludeId: isEditing ? reservaAEditar!.id : null
            };
            // Llama al endpoint de disponibilidad POST /api/reservas-escenario/disponibilidad
            const response = await axios.post('/api/reservas-escenario/disponibilidad', payload);
            const isAvailable = response.data.available;

            if (!isAvailable) {
                setErrorDisponibilidad('El escenario no está disponible en el horario seleccionado.');
                return false;
            }
            return true;

        } catch (error) {
            let errorMessage = 'Error de conexión al verificar disponibilidad.';
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.error || error.response.data.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            enqueueSnackbar(errorMessage, { variant: 'error' });
            return false;
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cargando || cargandoServicio || !formData.idEscenario || !formData.idServicio || !clienteEncontrado) {
            enqueueSnackbar('Asegúrate de seleccionar un escenario, tener un servicio asociado y validar un cliente.', { variant: 'warning' });
            return;
        }

        setCargando(true);
        setErrorDisponibilidad('');

        // 1. Validaciones de tiempo 
        const fechaInicio = new Date(formData.fechaInicio);
        const fechaFin = new Date(formData.fechaFin);

        if (fechaFin <= fechaInicio) {
            enqueueSnackbar('La hora de fin debe ser posterior a la de inicio.', { variant: 'warning' });
            setCargando(false);
            return;
        }
        if (fechaInicio < new Date() && !isEditing) {
            enqueueSnackbar('No se pueden crear reservas en el pasado.', { variant: 'warning' });
            setCargando(false);
            return;
        }

        // 2. Comprobar Disponibilidad con el Backend
        const isAvailable = await verificarDisponibilidad(formData);
        if (!isAvailable) {
            setCargando(false);
            return;
        }

        // 3. Preparación de Datos Finales para el CRUD
        const finalData = {
            ...formData,
            idCompany: currentCompanyId,
            fechaInicio: new Date(formData.fechaInicio).toISOString(),
            fechaFin: new Date(formData.fechaFin).toISOString(),
            estado: 'ACTIVO',
            id_cliente: clienteEncontrado.id,
            id_servicio: formData.idServicio,
        };

        // 4. Llamada al API para Guardar
        try {
            let response;
            if (isEditing) {
                response = await axios.put(`/api/reservas-escenario/${reservaAEditar!.id}`, finalData);
            } else {
                response = await axios.post('/api/reservas-escenario', finalData);
            }

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

    // Encuentra el escenario actualmente seleccionado en el form (necesario para la UI)
    const currentEscenario = useMemo(() => {
        return escenarios.find(e => e.id === formData.idEscenario) || null;
    }, [escenarios, formData.idEscenario]);

    const title = isEditing ? 'Modificar Reserva' : 'Confirmar Reserva';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <h3 className="mb-4 text-xl font-bold text-gray-800">
                {title}
            </h3>

            {/* CONTENEDOR SCROLLABLE */}
            <div className="flex-grow pr-8 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-hide">

                {/* SECCIÓN 1: ESCENARIO SELECCIONADO */}
                <div className="space-y-2">
                    <h3 className="pb-2 font-semibold text-gray-800 border-b border-gray-200 text-md">
                        Seleccionar Escenario
                    </h3>

                    <select
                        name="idEscenario"
                        value={formData.idEscenario || ''}
                        onChange={handleChange}
                        className="w-full py-2 pl-3 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-100"
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
                                    setClienteEncontrado(null);
                                    setBusquedaFallida(false);
                                    debouncedSearch(query);
                                }}
                                required
                                className="w-full py-2 pl-3 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-100"
                                disabled={cargando || !!clienteEncontrado}
                            />
                            {/* Indicador de carga */}
                            {cargandoCliente && <p className="mt-1 text-sm text-indigo-600">Buscando...</p>}
                        </div>

                       
                    </div>

                    {/* Mensaje de cliente no encontrado */}
                    {busquedaFallida && !clienteEncontrado && searchQuery.length >= 5 && (
                        <div className="p-2 text-sm text-red-700 border border-red-300 rounded-lg bg-red-50">
                            <p className="font-semibold">Cliente no encontrado.</p>
                            <button type="button" onClick={handleRegistroCliente} className="mt-1 text-blue-600 underline">
                                Registrar Nuevo Cliente
                            </button>
                        </div>
                    )}
                </div>

                {/* SECCIÓN 3: DETALLES DEL SERVICIO */}
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

                    {/* TIEMPO DE SERVICIO (Duración REAL) */}
                    <div>
                        <label htmlFor="tiempoServicio" className="block text-sm font-medium text-gray-700">Tiempo de Servicio (min)</label>
                        <div className="flex items-center p-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg">
                            <span className="mr-2 text-xl">⏱️</span>
                            <span>
                                {cargandoServicio ? '...' : `${duracionServicioMin} minutos (Fijo por servicio)`}
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
                            rows={2} /* Actualmente está en 2 */
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
                <div className="flex justify-end space-x-3">
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
                        {cargando ? 'Guardando...' : isEditing ? 'Modificar' : 'Reservar'}
                    </button>
                </div>

                {/* Mensaje de validación inferior */}
                {(!clienteEncontrado || !formData.idServicio) && (
                    <p className="pt-2 text-sm text-center text-danger">
                        ⚠️ {
                            !clienteEncontrado
                                ? 'Debes buscar y validar un cliente para confirmar la reserva.'
                                : 'El escenario seleccionado no tiene un servicio válido asignado.'
                        }
                    </p>
                )}
            </div>
        </form>
    );
};

export default ReservaEscenarioForm;