import axios from 'axios';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Escenario, ReservaEscenario, ServicioAsociado } from "../typesEscenario";
import { useSnackbar } from 'notistack';

// --- 1. DEFINICIÓN DE TIPOS ---

interface ReservaFormData {
    idEscenario: number | null;
    fechaInicio: string;        // Formato YYYY-MM-DDTHH:MM
    fechaFin: string;           // Formato YYYY-MM-DDTHH:MM (Solo para el backend)
    detalle: string;
    idCliente: string;          // Identificación del cliente
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
    escenarios = [], // FIX: Aseguramos que 'escenarios' sea siempre un array
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
    const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);

    // 🎯 CÁLCULO DE DURACIÓN (Depende del servicio REAL)
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
    const handleClienteAction = async () => {
        if (!formData.idCliente) {
            enqueueSnackbar('Ingresa una identificación de cliente.', { variant: 'warning' });
            return;
        }

        setCargando(true);
        try {
            const response = await axios.get(`/api/clientes/${formData.idCliente}`);
            const client = response.data;

            if (client && client.id) {
                setClienteEncontrado(client);
                enqueueSnackbar(`Cliente ${client.nombre || client.id} encontrado.`, { variant: 'success' });
            } else {
                enqueueSnackbar('Cliente no encontrado. Listo para registrar uno nuevo.', { variant: 'info' });
                setClienteEncontrado(null);
            }
        } catch (error) {
            console.error('Error buscando cliente:', error);
            setClienteEncontrado(null);
            enqueueSnackbar('Error al buscar cliente o cliente no encontrado. Listo para registrar uno nuevo.', { variant: 'error' });
        } finally {
            setCargando(false);
        }
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
            <div className="flex-grow pr-3 space-y-6 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800
            scrollbar-hide">

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
                            <label htmlFor="idCliente" className="sr-only">Identificación del Cliente</label>
                            <input
                                type="text"
                                id="idCliente"
                                name="idCliente"
                                placeholder="Identificación del Cliente"
                                value={formData.idCliente}
                                onChange={handleChange}
                                required
                                className="w-full py-2 pl-3 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-100"
                                disabled={cargando || !!clienteEncontrado}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleClienteAction}
                            disabled={cargando}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors 
                                ${clienteEncontrado
                                    ? 'bg-secondary text-gray-700 hover:bg-gray-300'
                                    : 'bg-success text-success-inverse hover:bg-success-active'
                                }
                            `}
                        >
                            {cargando ? 'Buscando...' : clienteEncontrado ? 'Cambiar' : 'Nuevo/Buscar'}
                        </button>
                    </div>
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
                            rows={2}
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