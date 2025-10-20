import React, { useState, useMemo, useCallback } from 'react'; 
import axios from 'axios';
import { useSnackbar } from 'notistack';

import { Prestador, Cliente, ClienteNuevo, ReservaFormProps } from "./types"; 
import { RegistroClienteForm } from './components/RegistroClienteForm'; 

// --- Constantes para Control de Horario ---
const HOURS_START = 7;   // 7:00 AM
const HOURS_END = 17;    // 5:00 PM (El rango termina un minuto antes, en 16:59)
const MINUTE_STEP = 30; // Intervalo de 30 minutos
const HOY = new Date(); 

const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]): void => { // <--- Ajuste aquí
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


export const ReservaForm = ({
  fechaSeleccionada,
  prestadores, 
  onCancelar,
  onGuardar, 
  currentCompanyId
}: ReservaFormProps) => { 

  const { enqueueSnackbar } = useSnackbar();
  
  const [isSaving, setIsSaving] = useState(false); 
   
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
    nombre1: '',
    apellido1: '',
    documento: '', 
    identificacion: '', 
    telefono: '', 
    email: '',
    direccion: '',
    telefonoFijo: '',
    celular: '',
    idTercero: 1, 
    password: '',
  });


    // --- Generación y Filtrado de Opciones de Hora ---
    const timeOptions = useMemo(() => {
        const options: string[] = [];
        
        const esHoy = fechaSeleccionada.toDateString() === HOY.toDateString();
        const ahora = new Date();
        const horaActualEnMinutos = ahora.getHours() * 60 + ahora.getMinutes();
        
        for (let h = HOURS_START; h < HOURS_END; h++) {
            for (let m = 0; m < 60; m += MINUTE_STEP) {
                const horaOpcionEnMinutos = h * 60 + m;
                
                // Excluir si es hoy y la hora ya pasó (margen de 1 minuto)
                if (esHoy && horaOpcionEnMinutos <= horaActualEnMinutos + 1) { 
                    continue; 
                }

                const hourString = String(h).padStart(2, '0');
                const minuteString = String(m).padStart(2, '0');
                options.push(`${hourString}:${minuteString}`);
            }
        }
        return options;
    }, [fechaSeleccionada]); 


    const prestadorSeleccionado = useMemo(() => {
        return prestadores.find(p => p.id === parseInt(formData.prestadorId));
    }, [formData.prestadorId, prestadores]);

    const serviciosDisponibles = useMemo(() => {
        return prestadorSeleccionado ? prestadorSeleccionado.servicios : [];
    }, [prestadorSeleccionado]);
    
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
                celular: '', 
                telefono: '',
                telefonoFijo: '',

                nombre1: '',
                apellido1: '',
                email: '',
                password: '',
                direccion: '',
                idTercero: currentCompanyId,
            }));
        }
    };
  
  
    const handleSaveClient = async (): Promise<Cliente | null> => {
        if (!modoRegistro) return null;
        const { nombre1, apellido1, documento, email, password, celular, direccion, telefonoFijo, idTercero } = clienteNuevo;
        if (!nombre1 || !apellido1 || !documento || !email || !password) {
            enqueueSnackbar('Debe completar el nombre, apellido, documento, email y contraseña del nuevo cliente.', { variant: 'warning' });
            return null;
        }

        try {
            const dataToSend = { 
                email: email,
                password: password,
                nombre1: nombre1,
                apellido1: apellido1,
                identificacion: documento, 
                telefono: celular || telefonoFijo, 
                direccion: direccion,
                idCompany: idTercero, 
            };

            setCargandoCliente(true);
            
            const response = await axios.post<any>('/register_web', dataToSend);
            
            setCargandoCliente(false);

            if (response.data && response.data.tercero) {
                
                const nuevoTercero: TerceroApi = response.data.tercero;
                
                const clienteFinal: Cliente = {
                    id: nuevoTercero.id,
                    documento: nuevoTercero.identificacion,
                    nombreCompleto: nuevoTercero.nombre 
                        ? nuevoTercero.nombre 
                        : `${nuevoTercero.nombre1 || ''} ${nuevoTercero.apellido1 || ''}`.trim(),
                    telefono: nuevoTercero.telefono, 
                    email: nuevoTercero.email,
                    nombre: nuevoTercero.nombre1,
                    nombre1: nuevoTercero.nombre1,
                    apellido1: nuevoTercero.apellido1,
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

    const handleNuevoClienteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setClienteNuevo(prev => ({ 
            ...prev, 
            [name]: value,
            identificacion: (name === 'documento' ? value : prev.identificacion) 
        }));
    };

    const getSafeDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!prestadorSeleccionado || !servicioSeleccionado || !formData.hora) {
            enqueueSnackbar('Debe completar la hora, prestador y servicio.', { variant: 'warning' });
            return;
        }
        
        // Validación de hora basada en las opciones disponibles
        if (!timeOptions.includes(formData.hora)) {
             enqueueSnackbar('❌ Error: La hora seleccionada no es válida o está fuera de horario.', { variant: 'error' });
             return;
        }


        if (!clienteSeleccionado || !clienteSeleccionado.email) {
            enqueueSnackbar('Debe seleccionar un cliente con correo electrónico válido.', { variant: 'warning' });
            return;
        }
        
        if (isSaving) return; 
        
        setIsSaving(true);
        
        if (!currentCompanyId || typeof currentCompanyId !== 'number' || currentCompanyId <= 0) {
            enqueueSnackbar('Error de configuración: No se pudo obtener el ID de la compañía.', { variant: 'error' });
            setIsSaving(false);
            return;
        }


        try {
            const payload = {
                fechaInicio: getSafeDateString(fechaSeleccionada), 
                
                horaInicial: formData.hora, 
                nota: formData.motivo, 
                
                idServicio: servicioSeleccionado.id, 
                idResponsable: prestadorSeleccionado.id, 
                emailCliente: clienteSeleccionado.email, 
            };
            
            const apiUrl = `/store_agenda_servicio_nexiservice/${currentCompanyId}`;
            const response = await axios.post(apiUrl, payload);
            
            if (response.status === 201) {
                enqueueSnackbar('✅ Reserva guardada con éxito.', { variant: 'success' });
                onGuardar(); 
                onCancelar(); 
            }

        } catch (error: any) {
            console.error('Error al guardar reserva:', error);
            const errorMessage = error.response?.data?.error || 'No se pudo guardar la reserva. Revise que la hora esté disponible y los datos sean correctos.';
            enqueueSnackbar(`Error: ${errorMessage}`, { variant: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const fechaString = fechaSeleccionada.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });


    return (
        <>
            <form className="flex flex-col space-y-4 max-h-[90vh] overflow-y-auto scrollbar-hide p-4 -m-4" onSubmit={handleSubmit}>
                <h2 className="mb-2 text-xl font-semibold">Nueva reserva — {fechaString}</h2>

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
                    {timeOptions.length === 0 && fechaSeleccionada.toDateString() === HOY.toDateString() && (
                        <p className="mt-1 text-sm text-red-600">No hay horas disponibles por hoy. Intente otro día.</p>
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
                
                {/* ... Lógica de búsqueda y registro de cliente ... */}
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">Buscar Cliente (CC o Teléfono):</label>
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={handleSearchChange} 
                        placeholder="Documento o teléfono"
                        className="p-2 border border-gray-300 rounded-lg" 
                    />
                    {cargandoCliente && <p className="text-sm text-indigo-600">Buscando cliente...</p>}
                    
                    {clienteSeleccionado ? (
                        <div className="p-3 mt-2 text-sm border-2 border-green-300 rounded-lg bg-green-50">
                            <p className="font-semibold">✅ Cliente Seleccionado:</p>
                            <p>{clienteSeleccionado.nombreCompleto}</p>
                            <p className="text-xs">{clienteSeleccionado.documento} | {clienteSeleccionado.email}</p>
                        </div>
                    ) : busquedaFallida && !modoRegistro ? (
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
                        {isSaving ? 'Guardando...' : 'Guardar Reserva'}
                    </button>
                </div>
            </form>
        </>
    );
}