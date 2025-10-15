// ReservaForm.tsx (Final con correcciones de FECHA y EMAIL para edición)

import React, { useState, useMemo, useCallback, useEffect } from 'react'; 
import axios from 'axios';
import { useSnackbar } from 'notistack';

// Asegúrate de que estos tipos estén definidos correctamente en "./types"
import { Prestador, Cliente, ClienteNuevo, ReservaFormProps, Reserva } from "./types"; 
import { RegistroClienteForm } from './RegistroClienteForm'; 

// --- Constantes para Control de Horario ---
const HOURS_START = 7;   // 7:00 AM
const HOURS_END = 17;    // 5:00 PM
const MINUTE_STEP = 30; // Intervalo de 30 minutos
const HOY = new Date(); 

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
}

// Función auxiliar para formatear Date a YYYY-MM-DD
const getSafeDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const ReservaForm = ({
  fechaSeleccionada, // Fecha del calendario
  prestadores, 
  onCancelar,
  onGuardar, 
  currentCompanyId,
  reservaAEditar
}: ReservaFormProps) => { 

  const { enqueueSnackbar } = useSnackbar();
  
  const [isSaving, setIsSaving] = useState(false); 
   
  // ESTADO CLAVE: Guarda la fecha seleccionada en el formulario para edición/reprogramación
  const [fechaFormulario, setFechaFormulario] = useState<Date>(fechaSeleccionada);
  
  const [formData, setFormData] = useState({
    prestadorId: '',
    servicioId: '',
    hora: '', 
    motivo: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [cargandoCliente, setCargandoCliente] = useState(false);
  const [busquedaFallida, setBusquedaFallida] = useState(false); 
  
  const [clienteNuevo, setClienteNuevo] = useState<ClienteNuevo>({
    nombre1: '', apellido1: '', documento: '', identificacion: '', telefono: '', 
    email: '', direccion: '', telefonoFijo: '', celular: '', idTercero: 1, password: '',
  });


    // Lógica de Inicialización para Edición (AJUSTADA PARA DATOS APLANADOS)
    useEffect(() => {
        if (reservaAEditar) {
            
            // ------------------- VALIDACIÓN Y CARGA DE DATOS -------------------
            console.log("--- INICIO DE CARGA DE EDICIÓN ---");
            console.log("reservaAEditar (Datos Brutos):", reservaAEditar);
            
            // 1. Obtener ID de Agenda y Prestador/Servicio
            const agendaId = (reservaAEditar as any).id || (reservaAEditar as any).idAgenda;
            
            if (!agendaId) {
                enqueueSnackbar('⚠️ Advertencia: No se encontró el ID de la Agenda. La edición podría fallar al guardar.', { variant: 'warning' });
            }
            console.log(`ID de Agenda: ${agendaId || 'N/A'}`);
            
            // 2. Cargar Prestador y Servicio 
            const prestador = prestadores.find(p => p.nombreCompleto === reservaAEditar.prestador);
            const servicio = prestador?.servicios.find(s => s.nombre === reservaAEditar.servicio);
            
            if (!prestador || !servicio) {
                 enqueueSnackbar('❌ Error de mapeo: Prestador o Servicio no encontrado por nombre.', { variant: 'error' });
            }
            console.log(`Prestador ID: ${prestador?.id} | Servicio ID: ${servicio?.id}`);

            // 3. Carga la Fecha (CORRECCIÓN DE ZONA HORARIA)
            const fechaReservaStr = (reservaAEditar as any).fecha || getSafeDateString(fechaSeleccionada);
            
            // ✅ CORRECCIÓN DE FECHA: Inicializar con números para evitar el desfase por zona horaria.
            const [year, month, day] = fechaReservaStr.split('-').map(Number);
            setFechaFormulario(new Date(year, month - 1, day)); // Mes es base 0
            
            // Carga la hora: Usa el campo 'hora' que llega y corta a HH:MM
            const horaCargada = reservaAEditar.hora 
                                  ? reservaAEditar.hora.substring(0, 5) 
                                  : '';
            
            setFormData({
                prestadorId: prestador ? prestador.id.toString() : '',
                servicioId: servicio ? servicio.id.toString() : '',
                hora: horaCargada, 
                motivo: reservaAEditar.motivo || '',
            });
            
            // 4. Cargar Cliente y Email (CORRECCIÓN DE EMAIL SIMULADO)
            const clienteEmailAplanado = (reservaAEditar as any).emailCliente || (reservaAEditar as any).email;
            
            // Intentar extraer el email si el nombre del cliente contiene el simulado
            let emailFinal = clienteEmailAplanado;
            let documentoFinal = (reservaAEditar as any).documentoCliente || 'N/A';
            
            if (reservaAEditar.cliente && reservaAEditar.cliente.includes('| simulado@ejemplo.com')) {
                // Si el cliente en la UI es "Nombre | N/A | simulado@ejemplo.com", extraemos el email simulado
                emailFinal = 'simulado@ejemplo.com';
                
                // Intentar extraer documento si viene en la cadena: "Nombre | Documento | Email"
                const parts = reservaAEditar.cliente.split(' | ');
                if (parts.length > 1 && parts[1] !== 'N/A') {
                    documentoFinal = parts[1];
                }
            }
            
            // Usar el email aplanado si no pudimos extraer el simulado, y si es null/undefined, usar 'N/A'
            if (!emailFinal || emailFinal === 'N/A') {
                emailFinal = 'N/A'; // Aseguramos que sea 'N/A' si no hay nada
            }
            
            // Mantenemos la advertencia solo si es simulado o no hay email
            if (emailFinal === 'N/A' || emailFinal.includes('@ejemplo.com')) {
                 enqueueSnackbar('⚠️ Advertencia: El email del cliente es "N/A" o simulado. Debe buscar al cliente real si desea guardar cambios de correo.', { variant: 'warning' });
            }

            const clienteFinal: Cliente = {
                id: (reservaAEditar as any).idCliente || 0, 
                documento: documentoFinal, 
                telefono: (reservaAEditar as any).telefonoCliente || 'N/A',
                email: emailFinal, // Email cargado (N/A, simulado o real)
                nombreCompleto: reservaAEditar.cliente,
            } as Cliente;
            
            setClienteSeleccionado(clienteFinal);
            // Si el cliente no tiene documento, usamos el nombre para buscar/mostrar
            setSearchQuery(documentoFinal !== 'N/A' ? documentoFinal : reservaAEditar.cliente); 
            setCargandoCliente(false); 
            setBusquedaFallida(false);
            
            // 🔍 Si el cliente llega sin email, intenta buscarlo por documento o nombre
// 🔍 Si el cliente llega sin email, intenta buscarlo por documento o teléfono
if (!emailFinal || emailFinal === 'N/A') {
    let criterioBusqueda = null;

    // Preferimos buscar por identificación o teléfono del cliente almacenado
    if (documentoFinal !== 'N/A') {
        criterioBusqueda = documentoFinal;
    } else if (clienteSeleccionado && clienteSeleccionado.telefono) {
        criterioBusqueda = clienteSeleccionado.telefono;
    }

    if (criterioBusqueda && criterioBusqueda.length >= 3) {
        console.log(`Intentando recuperar email real del cliente (${criterioBusqueda})...`);
        performSearch(criterioBusqueda);
    }
}


            
            console.log(`Fecha cargada (Formulario): ${getSafeDateString(new Date(year, month - 1, day))}`);
            console.log(`Hora cargada: ${horaCargada}`);
            console.log(`Email Cliente cargado: ${emailFinal}`);
            console.log("--- FIN DE CARGA DE EDICIÓN ---");

        } else {
            // Modo Creación
            setFormData({ prestadorId: '', servicioId: '', hora: '', motivo: '' });
            setClienteSeleccionado(null);
            setSearchQuery('');
            setFechaFormulario(fechaSeleccionada);
        }
    }, [reservaAEditar, prestadores, fechaSeleccionada, enqueueSnackbar]); 
    
    // ... [Resto del código (timeOptions, prestadorSeleccionado, serviciosDisponibles) sin cambios] ...
    const timeOptions = useMemo(() => {
        const options: string[] = [];
        const esHoy = fechaFormulario.toDateString() === HOY.toDateString();
        const ahora = new Date();
        const horaActualEnMinutos = ahora.getHours() * 60 + ahora.getMinutes();
        
        for (let h = HOURS_START; h < HOURS_END; h++) {
            for (let m = 0; m < 60; m += MINUTE_STEP) {
                const horaOpcionEnMinutos = h * 60 + m;
                
                if (esHoy && horaOpcionEnMinutos <= horaActualEnMinutos + 1) { 
                    continue; 
                }

                const hourString = String(h).padStart(2, '0');
                const minuteString = String(m).padStart(2, '0');
                options.push(`${hourString}:${minuteString}`);
            }
        }
        return options;
    }, [fechaFormulario]); 

    
    const prestadorSeleccionado = useMemo(() => prestadores.find(p => p.id === parseInt(formData.prestadorId)), [formData.prestadorId, prestadores]);
    const serviciosDisponibles = useMemo(() => prestadorSeleccionado ? prestadorSeleccionado.servicios : [], [prestadorSeleccionado]);
    const servicioSeleccionado = useMemo(() => {
        if (!serviciosDisponibles.length || !formData.servicioId) return null;
        return serviciosDisponibles.find(s => s.id === parseInt(formData.servicioId));
    }, [formData.servicioId, serviciosDisponibles]);

    
    const performSearch = async (query: string) => {
        if (!query || query.length < 6) {
            setClienteSeleccionado(null);
            setBusquedaFallida(false);
            setCargandoCliente(false);
            return;
        }

        setCargandoCliente(true);
        setClienteSeleccionado(null);
        setModoRegistro(false);
        setBusquedaFallida(false);
        
        const isCC = !isNaN(Number(query)) && query.length > 5;
        const url = isCC 
            ? `/terceros_by_cc/${query}` 
            : `/terceros_by_telefono/${query}`;

        try {
            const response = await axios.get<any>(url); 
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
                
                setClienteSeleccionado(clienteFinal);
                enqueueSnackbar('Cliente encontrado.', { variant: 'success' });
                
            } else {
                setClienteSeleccionado(null);
                setBusquedaFallida(true); 
            }
        } catch (error) {
            setClienteSeleccionado(null);
            setBusquedaFallida(true); 
        } finally {
            setCargandoCliente(false);
        }
        
        return; 
    };

    const debouncedSearch = useCallback(debounce(performSearch, 500), [performSearch]);


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        setClienteSeleccionado(null);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            if (name === 'prestadorId') {
                return { ...prev, prestadorId: value, servicioId: '' }; 
            }
            return { ...prev, [name]: value };
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Permite la reprogramación
        const newDate = new Date(e.target.value);
        setFechaFormulario(newDate);
    }

    const handleNuevoClienteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setClienteNuevo(prev => ({ 
            ...prev, 
            [name]: value,
            identificacion: (name === 'documento' ? value : prev.identificacion) 
        }));
    };

    // 3. Modificación del handleSubmit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isEditing = !!reservaAEditar; 
        const reservaId = isEditing ? (reservaAEditar as any).id || (reservaAEditar as any).idAgenda : null; 
        
        // --- Validaciones de Formulario ---
        if (!prestadorSeleccionado || !servicioSeleccionado || !formData.hora) {
            enqueueSnackbar('Debe completar la hora, prestador y servicio.', { variant: 'warning' });
            return;
        }
        
        if (!timeOptions.includes(formData.hora)) {
             enqueueSnackbar('❌ Error: La hora seleccionada no es válida o está fuera de horario.', { variant: 'error' });
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
        
        // --- Ejecución de API ---
        try {
            const payload = {
                // Usar la fecha del estado del formulario (permite reprogramación)
                fechaInicio: getSafeDateString(fechaFormulario), 
                
                horaInicial: formData.hora, 
                nota: formData.motivo, 
                
                idServicio: servicioSeleccionado.id, 
                idResponsable: prestadorSeleccionado.id, 
                emailCliente: clienteSeleccionado.email, 
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
            
            console.log(`Payload enviado a ${method.toUpperCase()} ${apiUrl}:`, payload);

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
                    {/* ✅ Línea 443 corregida con 'as any' */}
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
                        className="p-2 border border-gray-300 rounded-lg" 
                        required
                    />
                </div>
                
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">Hora:</label>
                    <select 
                        name="hora" 
                        value={formData.hora} 
                        onChange={handleChange} 
                        className="p-2 border border-gray-300 rounded-lg" 
                        required
                    >
                        <option value="">Seleccione una hora</option>
                        {timeOptions.map((time) => (
                            <option 
                                key={time} 
                                value={time}
                            >
                                {time}
                            </option>
                        ))}
                    </select>
                    {timeOptions.length === 0 && fechaFormulario.toDateString() === HOY.toDateString() && (
                        <p className="mt-1 text-sm text-red-600">No hay horas disponibles por hoy. Intente otra fecha.</p>
                    )}
                </div>
                
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">Prestador/Doctor:</label>
                    <select name="prestadorId" value={formData.prestadorId} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg" required>
                        <option value="">Seleccione un prestador</option>
                        {prestadores.map((p) => (<option key={p.id} value={p.id.toString()}>{p.nombreCompleto}</option>))}
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">Servicio:</label>
                    <select name="servicioId" value={formData.servicioId} onChange={handleChange} disabled={!prestadorSeleccionado} className="p-2 border border-gray-300 rounded-lg" required>
                        <option value="">{prestadorSeleccionado ? 'Seleccione un servicio' : 'Seleccione un prestador primero'}</option>
                        {serviciosDisponibles.map((s) => (<option key={s.id} value={s.id}>{s.nombre}</option>))}
                    </select>
                </div>
                
                {/* Cliente */}
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">Buscar Cliente (CC o Teléfono):</label>
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={handleSearchChange} 
                        placeholder="Documento o teléfono"
                        className="p-2 border border-gray-300 rounded-lg" 
                        disabled={!!reservaAEditar} 
                    />
                    {cargandoCliente && <p className="text-sm text-indigo-600">Buscando cliente...</p>}
                    
                    {clienteSeleccionado ? (
                        <div className="p-3 mt-2 text-sm border-2 border-green-300 rounded-lg bg-green-50">
                            <p className="font-semibold">✅ Cliente Seleccionado:</p>
                            <p>{clienteSeleccionado.nombreCompleto}</p>
                            <p className="text-xs">{clienteSeleccionado.documento} | {clienteSeleccionado.email}</p>
                        </div>
                    ) : busquedaFallida && !modoRegistro && !reservaAEditar ? (
                        <div className="p-3 mt-2 text-sm border border-red-300 rounded-lg bg-red-50">
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
                    <label className="mb-1 text-sm font-medium text-gray-700">Motivo/Nota:</label>
                    <input type="text" name="motivo" value={formData.motivo} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg" placeholder="Opcional" />
                </div>

                {/* Botones */}
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