import React, { useState, useMemo, useCallback } from 'react'; 
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Prestador, Cliente, ClienteNuevo } from "./types"; 
import { RegistroClienteForm } from './RegistroClienteForm'; 

// Función de Debounce 
const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

export const ReservaForm = ({
  fechaSeleccionada,
  prestadores, 
  onCancelar,
  onGuardar
}: {
  fechaSeleccionada: Date; 
  prestadores: Prestador[]; 
  onCancelar: () => void;
  onGuardar: (data: { 
    hora: string;
    cliente: string;
    motivo: string;
    servicio: string;
    prestador: string;
  }) => void;
}) => {
  const { enqueueSnackbar } = useSnackbar();
   
  const [formData, setFormData] = useState({
    prestadorId: '',
    servicioId: '',
    hora: '',
    motivo: '',
  });

  // ESTADOS DE GESTIÓN DEL CLIENTE
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
  });


  // ... Lógica useMemo (Mantenida) ...
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
      if (!query || query.length < 4) {
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
              // Cliente encontrado: Cargar y seleccionar
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
          setBusquedaFallida(true); // Marcar como fallida (por error de API)
      } finally {
          setCargandoCliente(false);
      }
  };

  // Debounce la función de búsqueda para usarla en onChange
  const debouncedSearch = useCallback(debounce(performSearch, 500), []);


  // NUEVO HANDLER PARA EL CAMBIO EN EL CAMPO DE BÚSQUEDA
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      
      // Limpiar estados relevantes inmediatamente al escribir
      setClienteSeleccionado(null);
      setBusquedaFallida(false);
      setModoRegistro(false); 
      
      debouncedSearch(query); // Llama a la búsqueda con el retraso
  };
  
  const handleOpenRegistroModal = () => {
      if (!clienteSeleccionado) {
          setModoRegistro(true);
          setClienteNuevo(prev => ({ 
            ...prev, 
            documento: searchQuery, 
            identificacion: searchQuery,
            celular: !isNaN(Number(searchQuery)) && searchQuery.length > 5 ? '' : searchQuery,
          }));
      }
  };


  const handleSaveClient = async (): Promise<Cliente | null> => {
      if (!modoRegistro) return null;
      const { nombre1, apellido1, documento } = clienteNuevo;
      if (!nombre1 || !apellido1 || !documento) {
          enqueueSnackbar('Debe completar el nombre, apellido y documento del nuevo cliente.', { variant: 'warning' });
          return null;
      }

      try {
          const dataToSend = { ...clienteNuevo, identificacion: clienteNuevo.documento };
          const response = await axios.post<any>('/store_person_tercero', dataToSend);
          
          const nuevoTercero = response.data.persona; 
          const nombreCompleto = `${nuevoTercero.nombre1} ${nuevoTercero.apellido1}`.trim();
          
          enqueueSnackbar('Nuevo cliente registrado y seleccionado.', { variant: 'success' });
          
          return {
              ...nuevoTercero,
              documento: nuevoTercero.identificacion,
              telefono: nuevoTercero.celular || nuevoTercero.telefonoFijo || '',
              nombreCompleto: nombreCompleto,
          } as Cliente;
      } catch (error) {
          console.error('Error al registrar nuevo cliente:', error);
          enqueueSnackbar('Error al registrar nuevo cliente.', { variant: 'error' });
          return null;
      }
  }

  const handleRegisterClientAndContinue = async () => {
    const cliente = await handleSaveClient();
    if (cliente) {
        setClienteSeleccionado(cliente);
        setModoRegistro(false); // Cierra el modal
        setBusquedaFallida(false); 
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prestadorSeleccionado || !servicioSeleccionado || !formData.hora) {
        enqueueSnackbar('Debe completar la hora, prestador y servicio.', { variant: 'warning' });
        return;
    }

    if (!clienteSeleccionado) {
        enqueueSnackbar('Debe seleccionar o registrar un cliente antes de guardar la reserva.', { variant: 'warning' });
        return;
    }
    
    // 🛑 Llamada a onGuardar usando las props directas
    onGuardar({
      hora: formData.hora,
      cliente: clienteSeleccionado.nombreCompleto, 
      motivo: formData.motivo,
      servicio: servicioSeleccionado.nombre,
      prestador: prestadorSeleccionado.persona.nombreCompleto, 
    });
    
  };

  const fechaString = fechaSeleccionada.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
  });


  return (
    <>
      {/* Formulario Principal (Scrollable) */}
      <form className="flex flex-col space-y-4 max-h-[90vh] overflow-y-auto scrollbar-hide p-4 -m-4" onSubmit={handleSubmit}>
        <h2 className="mb-2 text-xl font-semibold">Nueva reserva — {fechaString}</h2>

        {/* ... Campos de Hora, Prestador, Servicio  ... */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Hora:</label>
          <input type="time" name="hora" value={formData.hora} onChange={handleChange} className="p-2 border border-gray-300 rounded-lg" required />
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


        <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Cliente (Escriba Doc/Tel):</label>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange} // Búsqueda en VIVO con debounce
                    placeholder="Documento o Teléfono"
                    className="flex-grow p-2 border border-gray-300 rounded-lg"
                    disabled={!!clienteSeleccionado}
                />
                {/* INDICADOR DE CARGA (OPCIONAL) */}
                {cargandoCliente && (
                    <div className="text-sm text-blue-500">Buscando...</div>
                )}
                {/* BOTÓN PARA ABRIR EL MODAL (Si desea que se abra manualmente) */}
                {busquedaFallida && !clienteSeleccionado && (
                    <button 
                        type="button" 
                        onClick={handleOpenRegistroModal} 
                        className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                        Registrar
                    </button>
                )}
            </div>
        </div>
        
        {/* Resultado de la Búsqueda / Cliente Seleccionado */}
        <div> 
            {clienteSeleccionado && (
                <div className="p-3 mt-1 border border-green-400 rounded-lg bg-green-50">
                    <p className="font-semibold text-green-800">✅ Cliente Seleccionado:</p>
                    <p className="text-lg font-bold text-blue-400"> 
                        {clienteSeleccionado.nombreCompleto} 
                        {clienteSeleccionado.documento && ` (Doc: ${clienteSeleccionado.documento})`}
                    </p>
                    <div className="text-sm text-gray-700">
                        {clienteSeleccionado.telefono && (<p>📞 Teléfono: {clienteSeleccionado.telefono}</p>)}
                        {clienteSeleccionado.email && (<p>📧 Correo: {clienteSeleccionado.email}</p>)}
                    </div>
                        <button 
                            type="button" 
                            onClick={() => { setClienteSeleccionado(null); setModoRegistro(false); setSearchQuery(''); setBusquedaFallida(false); }} 
                            className="mt-1 text-sm text-red-500 hover:text-red-700"
                        >
                            Deshacer selección
                        </button>
                </div>
            )}

            {busquedaFallida && !clienteSeleccionado && searchQuery.length >= 4 && !cargandoCliente && (
                <div className="p-3 mt-1 font-medium text-red-800 border border-red-400 rounded-lg bg-red-50">
                    **Cliente no registrado.**
                    <span className='ml-2 text-xs text-red-600 cursor-pointer' onClick={handleOpenRegistroModal}>
                        (Click aquí para abrir el registro)
                    </span>
                </div>
            )}
        </div>
        
        {/* Motivo */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Motivo de consulta:</label>
          <input
            type="text"
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            placeholder="Ej: Dolor abdominal, chequeo..."
            className="p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end pt-2 space-x-3 actions">
          <button type="button" onClick={onCancelar} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
              Cancelar
          </button>
          <button 
              type="submit" 
              disabled={!clienteSeleccionado}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
          >
              Guardar Reserva
          </button>
        </div>
      </form>
      
      {/* MODAL DE REGISTRO FLOTANTE (RegistroClienteForm) */}
      {modoRegistro && (
          <RegistroClienteForm
              clienteNuevo={clienteNuevo}
              handleNuevoClienteChange={handleNuevoClienteChange}
              onClose={() => { setModoRegistro(false); setBusquedaFallida(false); }} 
              onConfirm={handleRegisterClientAndContinue}
          />
      )}
    </>
  );
};

export default ReservaForm;