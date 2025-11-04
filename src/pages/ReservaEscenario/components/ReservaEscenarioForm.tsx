import axios, { AxiosError } from 'axios';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Escenario, ReservaEscenario, ServicioAsociado } from "../typesEscenario"; 
import { useSnackbar } from 'notistack';

// --- 1. DEFINICIÓN DE TIPOS ---

interface ReservaFormData {
    idEscenario: number | null;
    fechaInicio: string;        // Formato YYYY-MM-DDTHH:MM
    fechaFin: string;           // Formato YYYY-MM-DDTHH:MM
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

// --- 3. COMPONENTE PRINCIPAL (SIN REDUNDANCIAS) ---

// Se mantiene la exportación por defecto (export default) para evitar el error inicial.
const ReservaEscenarioForm: React.FC<ReservaEscenarioFormProps> = ({
    fechaSeleccionada,
    escenarios,
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
        // Asume que el servicio tiene 'tiempoServicio' o 'duracionMin'
        const defaultDuration = 60; 
        const duracionReal = servicioSeleccionado?.tiempoServicio || (servicioSeleccionado as any)?.duracionMin; 
        
        return (typeof duracionReal === 'number' && duracionReal > 0) 
            ? duracionReal 
            : defaultDuration; 
            
    }, [servicioSeleccionado]); // Solo se recalcula si el servicioSeleccionado cambia

    // Inicialización del estado del formulario
    const initialEscenarioId = escenarioInicial?.id || (escenarios.length > 0 ? escenarios[0].id : null);

    const [formData, setFormData] = useState<ReservaFormData>(() => {
        const defaultStartHour = 9; 
        const fechaInicio = formatDateTimeLocal(fechaSeleccionada, defaultStartHour, 0);
        
        // Usamos una duración por defecto de 60 min para la inicialización
        const fechaFinDate = new Date(fechaInicio);
        fechaFinDate.setMinutes(fechaFinDate.getMinutes() + 60); 
        const fechaFin = fechaFinDate.toISOString().slice(0, 16);

        return {
            idEscenario: initialEscenarioId,
            fechaInicio,
            fechaFin,
            detalle: reservaAEditar?.detalle || '',
            idCliente: '',
            idServicio: reservaAEditar?.idServicio || null, 
        };
    });


    // 🎯 EFECTO ÚNICO: Cargar y Sincronizar el Servicio y la Fecha de Fin
    useEffect(() => {
        const idEscenario = isEditing ? reservaAEditar?.idEscenario : escenarioInicial?.id || formData.idEscenario;

        if (!idEscenario) {
            setServicioSeleccionado(null);
            setFormData(prev => ({ ...prev, idServicio: null }));
            return;
        }

        setCargandoServicio(true);
        setServicioSeleccionado(null);
        
        const cargarServicioAsociado = async () => {
            try {
                // 1. OBTENER ASIGNACIÓN Y SERVICIO (Usando tu doble llamada API)
                const asignacionResponse = await axios.get(`get_services_by_escenario/${idEscenario}`);

                if (asignacionResponse.data.length > 0) {
                    const idServicio = asignacionResponse.data[0].idServicio;
                    const servicioResponse = await axios.get(`/api/servicios/${idServicio}`);
                    const servicio: ServicioAsociado = servicioResponse.data;
                    
                    setServicioSeleccionado(servicio); // Guarda el objeto de servicio
                    
                    // 2. SINCRONIZAR formData con la duración del servicio cargado
                    setFormData(prev => {
                        // Calcula la nueva duración basada en el servicio (o 60 por defecto)
                        const newDuracion = servicio.tiempoServicio || (servicio as any).duracionMin || 60;
                        const newStartDate = new Date(prev.fechaInicio);
                        newStartDate.setMinutes(newStartDate.getMinutes() + newDuracion);
                        
                        return {
                            ...prev,
                            idEscenario: idEscenario, 
                            idServicio: servicio.id, // Sincroniza el ID del servicio
                            fechaFin: newStartDate.toISOString().slice(0, 16),
                        };
                    });

                    enqueueSnackbar(`Servicio "${servicio.nombre}" cargado.`, { variant: 'info' });

                } else {
                    setServicioSeleccionado(null);
                    setFormData(prev => ({ ...prev, idServicio: null }));
                    enqueueSnackbar('El escenario no tiene servicios asignados.', { variant: 'warning' });
                }
            } catch (error) {
                console.error("Error cargando servicio asociado:", error);
                enqueueSnackbar('Error al cargar la información del servicio.', { variant: 'error' });
            } finally {
                setCargandoServicio(false);
            }
        };

        cargarServicioAsociado();
    }, [escenarioInicial?.id, formData.idEscenario, isEditing, enqueueSnackbar]); // Depende del ID del escenario seleccionado.


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
                // Usa la duración REAL calculada
                newStartDate.setMinutes(newStartDate.getMinutes() + duracionServicioMin); 
                newFormData.fechaFin = newStartDate.toISOString().slice(0, 16);
            }

            return newFormData;
        });

        setErrorDisponibilidad(''); 
    }, [duracionServicioMin]); // duracionServicioMin es una dependencia clave

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

        // 1. Validaciones de tiempo (se mantienen)
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">
                {title}
            </h3>

            {/* SECCIÓN 1: ESCENARIO SELECCIONADO (Mismo código) */}
            {/* SECCIÓN 1: ESCENARIO SELECCIONADO */}
<div className="space-y-2">
  <h3 className="pb-2 font-semibold text-gray-800 border-b border-gray-200 text-md">
    Seleccionar Escenario
  </h3>

  <select
    name="idEscenario"
    value={formData.idEscenario || ''}
    onChange={async (e) => {
      handleChange(e); // mantiene tu lógica actual
      const idEscenario = parseInt(e.target.value);

      if (idEscenario) {
        setCargandoServicio(true);
        try {
          const response = await axios.get(`get_services_by_escenario/${idEscenario}`);
          if (response.data && response.data.length > 0) {
            const servicio = response.data[0];
            setServicioSeleccionado(servicio);

            // Actualiza servicio y fecha fin
            setFormData(prev => {
              const duracion = servicio.tiempoServicio || servicio.duracionMin || 60;
              const nuevaFechaFin = new Date(prev.fechaInicio);
              nuevaFechaFin.setMinutes(nuevaFechaFin.getMinutes() + duracion);
              return {
                ...prev,
                idServicio: servicio.id,
                fechaFin: nuevaFechaFin.toISOString().slice(0, 16),
              };
            });

            enqueueSnackbar(`Servicio "${servicio.nombre}" cargado para este escenario.`, { variant: 'info' });
          } else {
            setServicioSeleccionado(null);
            setFormData(prev => ({ ...prev, idServicio: null }));
            enqueueSnackbar('No hay servicios asignados a este escenario.', { variant: 'warning' });
          }
        } catch (error) {
          console.error('Error al obtener servicios por escenario:', error);
          enqueueSnackbar('Error al cargar servicios del escenario.', { variant: 'error' });
        } finally {
          setCargandoServicio(false);
        }
      }
    }}
    className="w-full py-2 pl-3 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
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


            {/* SECCIÓN 2: DATOS DEL CLIENTE (Mismo código) */}
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
                    // Deshabilitar si está cargando el servicio, o si falta servicio o cliente
                    disabled={cargando || cargandoServicio || !formData.idServicio || !clienteEncontrado}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-lg shadow-sm text-primary-inverse bg-primary hover:bg-primary-active focus:outline-none disabled:opacity-50"
                >
                    {cargando ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Confirmar Reserva'}
                </button>
            </div>
            
            {(!clienteEncontrado || !formData.idServicio) && (
                <p className="pt-2 text-sm text-center text-danger">
                    ⚠️ {
                        !clienteEncontrado 
                        ? 'Debes buscar y validar un cliente para confirmar la reserva.'
                        : 'El escenario seleccionado no tiene un servicio válido asignado.'
                    }
                </p>
            )}
        </form>
    );
};

export default ReservaEscenarioForm;