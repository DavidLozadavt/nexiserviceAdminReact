import axios, { AxiosError } from 'axios';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
// Asegúrate de que estos tipos estén correctamente importados desde tu archivo typesEscenario.ts
import { Escenario, ReservaEscenario, ServicioAsociado } from "../typesEscenario"; 
// Si no usas notistack, puedes reemplazar este hook por un simple console.log o alert
import { useSnackbar } from 'notistack';

// --- 1. DEFINICIÓN DE TIPOS ---

// Tipo extendido para incluir el cliente y la duración del servicio
interface ReservaFormData {
    idEscenario: number | null;
    fechaInicio: string;        // Formato YYYY-MM-DDTHH:MM
    fechaFin: string;           // Formato YYYY-MM-DDTHH:MM
    detalle: string;
    // Campos del cliente y servicio (necesarios para la lógica de la imagen)
    idCliente: string;          // Identificación del cliente
    idServicio: number | null;
}

interface ReservaEscenarioFormProps {
    fechaSeleccionada: Date;
    escenarios: Escenario[];
    currentCompanyId: number;

    reservaAEditar: (ReservaEscenario & { detalle: string }) | null;
    escenarioInicial: Escenario | null; // Objeto de escenario seleccionado

    onGuardar: () => void;
    onCancelar: () => void;
}

// --- 2. FUNCIONES DE UTILIDAD ---

// Formatea un objeto Date a la cadena requerida por <input type="datetime-local">
const formatDateTimeLocal = (date: Date, hours: number = 0, minutes: number = 0): string => {
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString().slice(0, 16);
};

// --- 3. COMPONENTE PRINCIPAL ---

export const ReservaEscenarioForm: React.FC<ReservaEscenarioFormProps> = ({
    fechaSeleccionada,
    escenarios,
    currentCompanyId,
    reservaAEditar,
    escenarioInicial,
    onGuardar,
    onCancelar,
}) => {

    // Reemplazo de useSnackbar por un hook local o un simple console.log/alert si no usas notistack
    const { enqueueSnackbar } = useSnackbar();
    const isEditing = !!reservaAEditar;
    
    // 🎯 Servicio precargado del escenario
    const servicioPrecargado: ServicioAsociado | null = useMemo(() => {
        return escenarioInicial?.servicio_asignado || null;
    }, [escenarioInicial]);

    // Duración predeterminada (60 minutos) o la del servicio asociado
    const duracionServicioMin = useMemo(() => {
        // Usamos 60 como valor seguro. Ajusta si tienes una propiedad 'duracionMin' en ServicioAsociado
        const defaultDuration = 60; 
        return defaultDuration; 
    }, [servicioPrecargado]);
    
    const initialEscenarioId = escenarioInicial?.id || (escenarios.length > 0 ? escenarios[0].id : null);

    // Inicializar el estado del formulario
    const [formData, setFormData] = useState<ReservaFormData>(() => {
        if (isEditing && reservaAEditar) {
            // EDICIÓN: Carga los datos existentes
            return {
                idEscenario: reservaAEditar.idEscenario,
                fechaInicio: reservaAEditar.fechaInicio.slice(0, 16),
                fechaFin: reservaAEditar.fechaFin.slice(0, 16),
                detalle: reservaAEditar.detalle,
                idCliente: '', 
                idServicio: null, 
            };
        } else {
            // NUEVA RESERVA: Usa la fecha seleccionada y la duración del servicio asociado
            const defaultStartHour = 9; // 9:00 AM
            const fechaInicio = formatDateTimeLocal(fechaSeleccionada, defaultStartHour, 0);
            
            const fechaFinDate = new Date(fechaInicio);
            fechaFinDate.setMinutes(fechaFinDate.getMinutes() + duracionServicioMin);
            const fechaFin = fechaFinDate.toISOString().slice(0, 16);

            return {
                idEscenario: initialEscenarioId,
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                detalle: '',
                idCliente: '',
                idServicio: servicioPrecargado?.id || null, 
            };
        }
    });

    const [cargando, setCargando] = useState(false);
    const [errorDisponibilidad, setErrorDisponibilidad] = useState('');
    const [clienteEncontrado, setClienteEncontrado] = useState<any>(null); // Datos del cliente encontrado

    // 🎯 useEffect para sincronizar el estado del formulario cuando cambia el escenarioInicial
    useEffect(() => {
        if (!isEditing && escenarioInicial) {
            const newIdServicio = escenarioInicial.servicio_asignado?.id || null;
            
            // Recalcular fechaFin basado en la duración del servicio
            const newDuracion = duracionServicioMin; 
            const fechaFinDate = new Date(formData.fechaInicio);
            fechaFinDate.setMinutes(fechaFinDate.getMinutes() + newDuracion);
            
            setFormData(prev => ({
                ...prev,
                idEscenario: escenarioInicial.id,
                idServicio: newIdServicio,
                fechaFin: fechaFinDate.toISOString().slice(0, 16),
            }));
        }
    }, [escenarioInicial, isEditing, duracionServicioMin]);


    // --- Handlers de Interacción ---

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newFormData = {
                ...prev,
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

        setErrorDisponibilidad(''); // Limpiar error al cambiar los datos
    }, [duracionServicioMin]);

    // Lógica para el botón "Nuevo" o Buscar Cliente
    const handleClienteAction = async () => {
        if (!formData.idCliente) {
            enqueueSnackbar('Ingresa una identificación de cliente.', { variant: 'warning' });
            return;
        }
        
        setCargando(true);
        try {
            // 🚨 SIMULACIÓN DE BÚSQUEDA DE CLIENTE
            const response = await axios.get(`/api/clientes/${formData.idCliente}`);
            const client = response.data;
            
            if (client && client.id) { // Asumo que el cliente tiene un campo 'id'
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
        // Validar campos esenciales antes del submit
        if (cargando || !formData.idEscenario || !formData.idServicio || !clienteEncontrado) {
            enqueueSnackbar('Asegúrate de seleccionar un escenario, un servicio y validar un cliente.', { variant: 'warning' });
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
            id_cliente: clienteEncontrado.id, // ID real del cliente encontrado
            id_servicio: formData.idServicio, 
        };

        // 4. Llamada al API para Guardar
        try {
            let response;
            if (isEditing) {
                // PUT /api/reservas-escenario/{id}
                response = await axios.put(`/api/reservas-escenario/${reservaAEditar!.id}`, finalData);
            } else {
                // POST /api/reservas-escenario
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">
                {title}
            </h3>

            {/* SECCIÓN 1: ESCENARIO SELECCIONADO (Precargado) */}
            <div className="p-4 border rounded-lg bg-primary-light border-primary-clarity">
                <p className="text-sm font-semibold text-primary">Escenario seleccionado:</p>
                <div className="flex items-center mt-1 space-x-2">
                    {/* Simulación de icono o imagen del escenario */}
                    <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-primary">
                        {currentEscenario?.imagenUrl ? (
                            <img src={currentEscenario.imagenUrl} alt="Escenario" className="object-cover w-full h-full rounded-full"/>
                        ) : (
                            <span>🏟️</span> 
                        )}
                    </div>
                    <span className="font-bold text-gray-800">{currentEscenario?.nombre || 'Selecciona un escenario'}</span>
                </div>
                <input type="hidden" name="idEscenario" value={formData.idEscenario || ''} />
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
                            className="w-full py-2 pl-3 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
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
                                ? 'bg-secondary text-gray-700 hover:bg-gray-300' // Si ya está, botón "Cambiar"
                                : 'bg-success text-success-inverse hover:bg-success-active' // Botón "Nuevo/Buscar"
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

                {/* SERVICIO PRECARGADO */}
                <div>
                    <label htmlFor="servicio" className="block text-sm font-medium text-gray-700">Servicio</label>
                    <p className="p-2 mt-1 text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                        {servicioPrecargado?.nombre || 'Servicio no asignado al escenario'}
                    </p>
                    <input type="hidden" name="idServicio" value={formData.idServicio || ''} />
                </div>
                
                {/* TIEMPO DE SERVICIO (Duración precargada) */}
                <div>
                    <label htmlFor="tiempoServicio" className="block text-sm font-medium text-gray-700">Tiempo de Servicio (min)</label>
                    <div className="flex items-center p-2 mt-1 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg">
                        {/* ⏱️ REEMPLAZO DEL ICONO IoTimeOutline POR UN EMOJI ⏱️ */}
                        <span className="mr-2 text-xl">⏱️</span> 
                        <span>{duracionServicioMin} minutos (Fijo por servicio)</span>
                    </div>
                </div>
                
                {/* FECHA Y HORA */}
                <div className="grid grid-cols-2 gap-4">
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
                            className="block w-full mt-1 border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                            disabled={cargando}
                        />
                    </div>
                    <div>
                        <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">
                            Fin (Auto) <span className="text-danger">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            id="fechaFin"
                            name="fechaFin"
                            value={formData.fechaFin}
                            readOnly
                            className="block w-full mt-1 text-gray-600 bg-gray-100 border-gray-300 rounded-lg shadow-sm sm:text-sm"
                        />
                    </div>
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
                        className="block w-full mt-1 border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
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

            {/* BOTONES DE ACCIÓN */}
            <div className="flex justify-end pt-2 space-x-3">
                <button
                    type="button"
                    onClick={onCancelar}
                    disabled={cargando}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-transparent rounded-lg shadow-sm bg-secondary hover:bg-gray-300 focus:outline-none"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    // Deshabilitar si no hay cliente o servicio
                    disabled={cargando || !formData.idServicio || !clienteEncontrado}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-lg shadow-sm text-primary-inverse bg-primary hover:bg-primary-active focus:outline-none"
                >
                    {cargando ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Confirmar Reserva'}
                </button>
            </div>
            
            {!clienteEncontrado && (
                <p className="pt-2 text-sm text-center text-danger">
                    ⚠️ Debes buscar y validar un cliente para confirmar la reserva.
                </p>
            )}
        </form>
    );
};