import React, { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack'; 
import { Prestador, Cliente, ClienteNuevo, ReservaFormProps, Reserva } from "../types";
import { RegistroClienteForm } from './RegistroClienteForm';

// --- Constantes y Tipos Auxiliares ---
const HOURS_START: number = 7; 
const HOURS_END: number = 17; 
const MINUTE_STEP: number = 30; 
const HOY: Date = new Date();

const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]): void => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

interface TerceroApi {
    id: number;
    identificacion: string;
    nombre: string;
    telefono: string;
    email: string;
    nombre1: string;
    apellido1: string;
    idCompany: number;
    celular?: string;
    telefonoFijo?: string;
}

interface FormDataState {
    prestadorId: string;
    servicioId: string;
    hora: string;
    motivo: string;
}

interface TimeOption {
    time: string;
    isPast: boolean;
    isOccupied: boolean;
}

const getSafeDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const ReservaForm = ({
    fechaSeleccionada, 
    prestadores,
    onCancelar,
    onGuardar,
    currentCompanyId,
    reservaAEditar
}: ReservaFormProps) => {

    const { enqueueSnackbar } = useSnackbar();
    const [isSaving, setIsSaving] = useState<boolean>(false);
    
    const [fechaFormulario, setFechaFormulario] = useState<Date>(
        new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), fechaSeleccionada.getDate(), 12) 
    );
    
    const [formData, setFormData] = useState<FormDataState>({
        prestadorId: '',
        servicioId: '',
        hora: '',
        motivo: '',
    });

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [modoRegistro, setModoRegistro] = useState<boolean>(false);
    const [cargandoCliente, setCargandoCliente] = useState<boolean>(false);
    const [busquedaFallida, setBusquedaFallida] = useState<boolean>(false);
    const [clienteNuevo, setClienteNuevo] = useState<ClienteNuevo>({
        nombre1: '', apellido1: '', documento: '', identificacion: '', telefono: '',
        email: '', direccion: '', telefonoFijo: '', celular: '', idTercero: 1, password: '',
    });

    const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);

    // --- Funciones de Búsqueda y Cliente ---

    const performSearch = async (query: string): Promise<Cliente | null> => {
        if (!query || query.length < 5) {
            return null;
        }

        if (!reservaAEditar || searchQuery !== query) {
            setCargandoCliente(true);
        }

        const isCC = !isNaN(Number(query)) && query.length > 5;
        const url = isCC
            ? `/terceros_by_cc/${query}`
            : `/terceros_by_telefono/${query}`;

        try {
            const response = await axios.get<TerceroApi>(url);
            const tercero = response.data;

            if (tercero && tercero.id) {
                const nombreCompleto = tercero.nombre
                    ? tercero.nombre
                    : `${tercero.nombre1 || ''} ${tercero.apellido1 || ''}`.trim();
                
                const clienteFinal: Cliente = {
                    id: tercero.id,
                    documento: tercero.identificacion,
                    telefono: tercero.telefono || tercero.celular || tercero.telefonoFijo || '',
                    email: tercero.email || '',
                    nombreCompleto: nombreCompleto,
                    nombre: tercero.nombre,
                    nombre1: tercero.nombre1,
                    apellido1: tercero.apellido1
                };

                if (!reservaAEditar || searchQuery !== query) {
                    setClienteSeleccionado(clienteFinal);
                    enqueueSnackbar('Cliente encontrado.', { variant: 'success' });
                    setBusquedaFallida(false);
                }

                return clienteFinal;

            } else {
                if (!reservaAEditar || searchQuery !== query) {
                    setClienteSeleccionado(null);
                    setBusquedaFallida(true);
                }
                return null;
            }
        } catch (error) {
            if (!reservaAEditar || searchQuery !== query) {
                setClienteSeleccionado(null);
                setBusquedaFallida(true);
            }
            return null;
        } finally {
            if (!reservaAEditar || searchQuery !== query) {
                setCargandoCliente(false);
            }
        }
    };

    const performSearchAndSetClient = useCallback(async (query: string) => {
        const clienteReal = await performSearch(query);
        if (clienteReal) {
            setClienteSeleccionado(clienteReal);
            enqueueSnackbar('Email real del cliente recuperado con éxito.', { variant: 'info' });
        }
    }, [enqueueSnackbar]);

    const debouncedSearch = useCallback(debounce((query: string) => {
        performSearch(query);
    }, 500), []);


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (!reservaAEditar || query !== searchQuery) {
            setClienteSeleccionado(null);
        }
        setBusquedaFallida(false);
        setModoRegistro(false);
        debouncedSearch(query);
    };

    const handleOpenRegistroModal = () => {
        if (!clienteSeleccionado) {
            setModoRegistro(true);
            setClienteNuevo(prev => ({
                ...prev,
                documento: searchQuery,
                identificacion: searchQuery,
                celular: '', telefono: '', telefonoFijo: '', nombre1: '', apellido1: '',
                email: '', password: '', direccion: '', idTercero: currentCompanyId,
            }));
        }
    };
    
    const handleSaveClient = async (): Promise<Cliente | null> => {
        if (!modoRegistro) return null;
        const { nombre1, apellido1, documento, email, password, celular, direccion, telefonoFijo, idTercero } = clienteNuevo;
        if (!nombre1 || !apellido1 || !documento || !email || !password) {
            enqueueSnackbar('Debe completar campos obligatorios.', { variant: 'warning' });
            return null;
        }

        try {
            const dataToSend = {
                email: email, password: password, nombre1: nombre1, apellido1: apellido1,
                identificacion: documento, telefono: celular || telefonoFijo,
                direccion: direccion, idCompany: idTercero,
            };

            setCargandoCliente(true);
            const response = await axios.post<any>('/register_web', dataToSend);
            setCargandoCliente(false);

            if (response.data && response.data.tercero) {
                const nuevoTercero: TerceroApi = response.data.tercero;
                const clienteFinal: Cliente = {
                    id: nuevoTercero.id, documento: nuevoTercero.identificacion,
                    nombreCompleto: nuevoTercero.nombre ? nuevoTercero.nombre : `${nuevoTercero.nombre1 || ''} ${nuevoTercero.apellido1 || ''}`.trim(),
                    telefono: nuevoTercero.telefono, email: nuevoTercero.email,
                    nombre: nuevoTercero.nombre1, nombre1: nuevoTercero.nombre1, apellido1: nuevoTercero.apellido1,
                };
                enqueueSnackbar('Nuevo cliente registrado y seleccionado.', { variant: 'success' });
                return clienteFinal;
            }
            throw new Error('Registro exitoso, pero fallo al recuperar los datos del cliente.');

        } catch (error: any) {
            setCargandoCliente(false);
            const errorMessage = error.response?.data?.error || error.message;
            enqueueSnackbar(`Error al registrar nuevo cliente: ${errorMessage}`, { variant: 'error' });
            return null;
        }
    }

    const handleRegisterClientAndContinue = async () => {
        const cliente = await handleSaveClient();
        if (cliente) {
            setClienteSeleccionado(cliente);
            setModoRegistro(false);
            setBusquedaFallida(false);
            setSearchQuery(cliente.documento || cliente.telefono || '');
            return;
        }
        return;
    };
    
    const handleNuevoClienteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setClienteNuevo(prev => ({
            ...prev,
            [name]: value,
            identificacion: (name === 'documento' ? value : prev.identificacion)
        }));
    };
    

    // --- useEffect: Inicialización y Edición ---
    useEffect(() => {
        if (reservaAEditar) {
            const prestador = prestadores.find(p => p.nombreCompleto === reservaAEditar.prestador);
            const servicio = prestador?.servicios.find(s => s.nombre === reservaAEditar.servicio);

            const fechaReservaStr = (reservaAEditar as any).fecha || getSafeDateString(fechaSeleccionada);
            const [year, month, day] = fechaReservaStr.split('-').map(Number);
            
            setFechaFormulario(new Date(year, month - 1, day, 12)); 
            
            const horaCargada = reservaAEditar.hora
                ? reservaAEditar.hora.substring(0, 5)
                : '';
            setFormData({
                prestadorId: prestador ? prestador.id.toString() : '',
                servicioId: servicio ? servicio.id.toString() : '',
                hora: horaCargada,
                motivo: reservaAEditar.motivo || '',
            });

            const documentoFinal = (reservaAEditar as any).documentoCliente || (reservaAEditar as any).documento || 'N/A';
            const telefonoFinal = (reservaAEditar as any).telefonoCliente || (reservaAEditar as any).telefono || 'N/A';
            const emailClienteAplanado = (reservaAEditar as any).emailCliente || (reservaAEditar as any).email;
            let emailFinal = emailClienteAplanado || 'N/A';

            const clienteFinal: Cliente = {
                id: (reservaAEditar as any).idCliente || 0,
                documento: documentoFinal,
                telefono: telefonoFinal,
                email: emailFinal,
                nombreCompleto: reservaAEditar.cliente,
            } as Cliente;
            setClienteSeleccionado(clienteFinal);

            let criterioBusqueda = documentoFinal !== 'N/A' ? documentoFinal : telefonoFinal !== 'N/A' ? telefonoFinal : null;

            if (emailFinal === 'N/A' && criterioBusqueda && criterioBusqueda.length >= 3) {
                performSearchAndSetClient(criterioBusqueda);
            }

            setSearchQuery(documentoFinal !== 'N/A' ? documentoFinal : reservaAEditar.cliente);
            setCargandoCliente(false);
            setBusquedaFallida(false);

        } else {
            setFormData({ prestadorId: '', servicioId: '', hora: '', motivo: '' });
            setClienteSeleccionado(null);
            setSearchQuery('');
            setFechaFormulario(new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), fechaSeleccionada.getDate(), 12));
        }
    }, [reservaAEditar, prestadores, fechaSeleccionada, enqueueSnackbar, performSearchAndSetClient]);

    // --- useMemo: Generación de Opciones de Hora ---

    const timeOptions = useMemo<TimeOption[]>(() => {
        const options: TimeOption[] = [];
        const esHoy = fechaFormulario.toDateString() === HOY.toDateString();
        const ahora = new Date();
        const horaActualEnMinutos = ahora.getHours() * 60 + ahora.getMinutes() + MINUTE_STEP;

        for (let h = HOURS_START; h < HOURS_END; h++) {
            for (let m = 0; m < 60; m += MINUTE_STEP) {
                const hourString = String(h).padStart(2, '0');
                const minuteString = String(m).padStart(2, '0');
                const horaOpcion = `${hourString}:${minuteString}`;
                
                const horaOpcionEnMinutos = h * 60 + m;
                
                const isPast = esHoy && horaOpcionEnMinutos < horaActualEnMinutos;
                const isOccupied = horasOcupadas.includes(horaOpcion); 

                const isCurrentReservationTime = reservaAEditar?.hora?.substring(0, 5) === horaOpcion;

                if (isPast && !isCurrentReservationTime) {
                     continue; 
                }

                options.push({ time: horaOpcion, isPast, isOccupied });
            }
        }
        return options;
    }, [fechaFormulario, horasOcupadas, reservaAEditar]); 

    // --- useEffect: Llamada a API de Horas Ocupadas ---

    useEffect(() => {
        const fetchHorasOcupadas = async () => {
            const prestadorId = formData.prestadorId;

            if (!prestadorId || !fechaFormulario) {
                setHorasOcupadas([]);
                return;
            }

            try {
                const fechaStr = getSafeDateString(fechaFormulario);
                const apiUrl = `/agenda/horas-ocupadas/${prestadorId}/${fechaStr}`; 
                
                const response = await axios.get<string[]>(apiUrl);
                
                if (!Array.isArray(response.data)) {
                    setHorasOcupadas([]);
                    return;
                }
                
                const horaReservaActual = reservaAEditar?.hora?.substring(0, 5);
                const horasFiltradas = response.data
                    .filter(hora => hora !== horaReservaActual && hora.length >= 5)
                    .map(hora => hora.substring(0, 5)); 
                
                setHorasOcupadas(horasFiltradas);
                
            } catch (error) {
                console.error("[API_CALL] Error al obtener horas ocupadas:", error);
                setHorasOcupadas([]);
            }
        };

        fetchHorasOcupadas();
        
    }, [formData.prestadorId, fechaFormulario, reservaAEditar]);

    // --- Handlers de Formulario ---

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            if (name === 'prestadorId') {
                setHorasOcupadas([]);
                return { ...prev, prestadorId: value, servicioId: '', hora: '' };
            }
            
            if (name === 'hora' && value !== '') {
                const isCurrentReservation = reservaAEditar?.hora?.substring(0, 5) === value;
                
                if (horasOcupadas.includes(value) && !isCurrentReservation) {
                    enqueueSnackbar('❌ La hora seleccionada está reservada. Seleccione una disponible.', { variant: 'warning' });
                    return prev; 
                }
            }
            return { ...prev, [name]: value };
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateString = e.target.value;
        const [yearStr, monthStr, dayStr] = dateString.split('-').map(str => parseInt(str, 10));
        
        const newDate = new Date(yearStr, monthStr - 1, dayStr, 12);
        
        setFechaFormulario(newDate);
        setHorasOcupadas([]);
        setFormData(prev => ({ ...prev, hora: '' })); 
    }

    const prestadorSeleccionado = useMemo(() => prestadores.find(p => p.id === parseInt(formData.prestadorId)), [formData.prestadorId, prestadores]);
    const serviciosDisponibles = useMemo(() => prestadorSeleccionado ? prestadorSeleccionado.servicios : [], [prestadorSeleccionado]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isEditing = !!reservaAEditar;
        const reservaId = isEditing ? (reservaAEditar as any).id || (reservaAEditar as any).idAgenda : null;

        if (!prestadorSeleccionado || !formData.hora || !formData.servicioId) {
            enqueueSnackbar('Debe completar la hora, prestador y servicio.', { variant: 'warning' });
            return;
        }
        
        // Revalidación FINAL
        const isSelectedTimeOccupied = horasOcupadas.includes(formData.hora);
        const isCurrentReservationTime = reservaAEditar && reservaAEditar.hora && reservaAEditar.hora.substring(0, 5) === formData.hora;
        
        if (isSelectedTimeOccupied && !isCurrentReservationTime) {
             enqueueSnackbar('❌ Error: La hora seleccionada ya está reservada. Por favor, elija otra.', { variant: 'error' });
             return;
        }

        if (!clienteSeleccionado || !clienteSeleccionado.email || clienteSeleccionado.email === 'N/A') {
            enqueueSnackbar('Debe seleccionar un cliente con correo electrónico válido.', { variant: 'warning' });
            return;
        }
        if (isEditing && !reservaId) {
            enqueueSnackbar('❌ Error crítico: No se encontró el ID de la reserva para modificar.', { variant: 'error' });
            return;
        }

        if (isSaving) return;
        setIsSaving(true);

        try {
            const servicioSeleccionado = serviciosDisponibles.find(s => s.id === parseInt(formData.servicioId));

            const payload = {
                fechaInicio: getSafeDateString(fechaFormulario),
                horaInicial: formData.hora,
                nota: formData.motivo,
                idServicio: servicioSeleccionado?.id,
                idResponsable: prestadorSeleccionado.id, 
                emailCliente: clienteSeleccionado.email,
                idCliente: clienteSeleccionado.id,
            };
            let apiUrl = '';
            let method: 'post' | 'put' = 'post';

            if (isEditing) {
                apiUrl = `/update_agenda_servicio_nexiservice/${reservaId}`;
                method = 'put'; 
            } else {
                apiUrl = `/store_agenda_servicio_nexiservice/${currentCompanyId}`;
                method = 'post';
            }

            const response = await axios[method](apiUrl, payload);
            if (response.status === 200 || response.status === 201) {
                const message = isEditing ? '✅ Reserva modificada con éxito.' : '✅ Reserva guardada con éxito.';
                enqueueSnackbar(message, { variant: 'success' });
                onGuardar();
                onCancelar();
            }

        } catch (error: any) {
            console.error(`Error al ${isEditing ? 'modificar' : 'guardar'} reserva:`, error);
            const errorMessage = error.response?.data?.error || 'No se pudo guardar la reserva.';
            enqueueSnackbar(`Error: ${errorMessage}`, { variant: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

//
    const fechaString = fechaFormulario.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
            <form className="flex flex-col space-y-4 max-h-[90vh] overflow-y-auto scrollbar-hide p-4 -m-4" onSubmit={handleSubmit}>
                <h2 className="mb-2 text-xl font-semibold">
                    {reservaAEditar ? `Modificar Reserva — ID: ${(reservaAEditar as any).id || (reservaAEditar as any).idAgenda || 'N/A'}` : `Nueva reserva`}
                </h2>

                <p className="mb-4 text-sm font-medium text-gray-600">
                    {reservaAEditar ? 'Reprogramación' : 'Creación'} para: <span className="font-semibold text-blue-700">{fechaString}</span>
                </p>

                {/* Selector de Fecha para Reprogramar */}
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">Fecha de Reserva:</label>
                    <input
                        type="date"
                        value={getSafeDateString(fechaFormulario)}
                        onChange={handleDateChange}
                        className="p-2 border border-gray-300 rounded-lg dark:bg-gray-100"
                        required
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">Prestador/Doctor:</label>
                    <select 
                        name="prestadorId" 
                        value={formData.prestadorId} 
                        onChange={handleChange} 
                        className="p-2 border border-gray-300 rounded-lg dark:bg-gray-100" 
                        required
                    >
                        <option value="">Seleccione un prestador</option>
                        {prestadores.map((p) => (<option key={p.id} value={p.id.toString()}>{p.nombreCompleto}</option>))}
                    </select>
                </div>
                
                {/* Selector de Hora */}
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700 ">Hora:</label>
                    <select
                        name="hora"
                        value={formData.hora}
                        onChange={handleChange}
                        className="p-2 text-gray-700 border border-gray-300 rounded-lg dark:bg-gray-100"
                        required
                        disabled={!formData.prestadorId}
                    >
                        <option value="">{formData.prestadorId ? 'Seleccione una hora' : 'Seleccione un prestador y fecha'}</option>
                        {timeOptions.map((option) => {
                            const isCurrentReservation = reservaAEditar?.hora?.substring(0, 5) === option.time;
                            
                            const isDisabled = option.isOccupied && !isCurrentReservation;
                            
                            let label = option.time;
                            if (option.isOccupied) {
                                label += ' (Reservada)';
                            } else if (option.isPast) {
                                label += ' (Pasada)'; 
                            }

                            return (
                                <option
                                    key={option.time}
                                    value={option.time}
                                    disabled={isDisabled}
                                    className={isDisabled ? 'text-gray-400 bg-gray-100' : ''} 
                                >
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                    {!formData.prestadorId && (
                        <p className="mt-1 text-sm text-gray-500">Seleccione un prestador para ver las horas disponibles.</p>
                    )}
                    {formData.prestadorId && timeOptions.length === 0 && (
                        <p className="mt-1 text-sm text-red-600">No hay horas disponibles en este horario.</p>
                    )}
                </div>
                
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700 ">Servicio:</label>
                    <select 
                        name="servicioId" 
                        value={formData.servicioId} 
                        onChange={handleChange} 
                        disabled={!prestadorSeleccionado} 
                        className="p-2 border border-gray-300 rounded-lg dark:bg-gray-100 " 
                        required
                    >
                        <option value="">{prestadorSeleccionado ? 'Seleccione un servicio' : 'Seleccione un prestador primero'}</option>
                        {prestadorSeleccionado?.servicios.map((s) => (<option key={s.id} value={s.id}>{s.nombre}</option>))}
                    </select>
                </div>
                
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">Buscar Cliente (CC o Teléfono):</label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Documento o teléfono"
                        className="p-2 text-gray-900 border border-gray-300 rounded-lg dark:bg-gray-100"
                        disabled={!!reservaAEditar && !!clienteSeleccionado && clienteSeleccionado.email !== 'N/A'}
                    />
                    {cargandoCliente && <p className="text-sm text-indigo-600">Buscando cliente...</p>}
                    {clienteSeleccionado ? (
                        <div className="p-3 mt-2 text-sm border-2 border-green-300 rounded-lg bg-green-50 dark:bg-gray-100">
                            <p className="font-semibold">✅ Cliente Seleccionado:</p>
                            <p>{clienteSeleccionado.nombreCompleto}</p>
                            <p className="text-xs">{clienteSeleccionado.documento} | {clienteSeleccionado.email}</p>
                        </div>
                    ) : busquedaFallida && !modoRegistro && !reservaAEditar ? (
                        <div className="p-3 mt-2 text-sm border border-red-300 rounded-lg bg-red-50 dark:bg-gray-100">
                            <p className="font-semibold">Cliente no encontrado.</p>
                            <button type="button" onClick={handleOpenRegistroModal} className="mt-1 text-blue-600 underline">
                                Registrar Nuevo Cliente
                            </button>
                        </div>
                    ) : null}
                </div>

                {modoRegistro && (
                    <div className="p-4 mt-2 border border-indigo-300 rounded-lg bg-indigo-50">
                        <RegistroClienteForm
                            clienteNuevo={clienteNuevo}
                            handleNuevoClienteChange={handleNuevoClienteChange}
                            onConfirm={handleRegisterClientAndContinue}
                            onClose={() => setModoRegistro(false)}
                        />
                    </div>
                )}
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700 ">Motivo/Nota:</label>
                    <input type="text" name="motivo" value={formData.motivo} onChange={handleChange} className="p-2 text-gray-900 border border-gray-300 rounded-lg dark:bg-gray-100" placeholder="Opcional" />
                </div>

                <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancelar}
                        className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                        disabled={isSaving || !clienteSeleccionado || !formData.hora || !formData.prestadorId || !formData.servicioId || timeOptions.length === 0}
                    >
                        {isSaving ? 'Guardando...' : reservaAEditar ? 'Guardar Cambios' : 'Guardar Reserva'}
                    </button>
                </div>
            </form>
        </>
    );
}