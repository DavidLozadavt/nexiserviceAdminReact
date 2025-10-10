import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Prestador, ReservaFormProps, Cliente } from "./types"; 

export const ReservaForm = ({
  fechaSeleccionada,
  prestadores, 
  onCancelar,
  onGuardar
}: ReservaFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
   
  //  Estado del formulario de reserva
  const [formData, setFormData] = useState({
    prestadorId: '',
    servicioId: '',
    hora: '',
    motivo: '',
  });

  //  ESTADOS DE GESTIÓN DEL CLIENTE
  const [searchQuery, setSearchQuery] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [cargandoCliente, setCargandoCliente] = useState(false);
  
  // Estado para los datos del nuevo cliente (que se guardarán como Person)
  const [clienteNuevo, setClienteNuevo] = useState({
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


  // 1. Obtiene el objeto Prestador seleccionado
  const prestadorSeleccionado = useMemo(() => {
    return prestadores.find(p => p.id === parseInt(formData.prestadorId));
  }, [formData.prestadorId, prestadores]);


  // 2. Filtra los servicios disponibles basados en el prestador
  const serviciosDisponibles = useMemo(() => {
    return prestadorSeleccionado ? prestadorSeleccionado.servicios : [];
  }, [prestadorSeleccionado]);
  
  // 3. Obtiene el objeto Servicio seleccionado
  const servicioSeleccionado = useMemo(() => {
    if (!serviciosDisponibles.length || !formData.servicioId) return null;
    return serviciosDisponibles.find(s => s.id === parseInt(formData.servicioId));
  }, [formData.servicioId, serviciosDisponibles]);




  const handleSearchCliente = async (query: string) => {
      if (!query) return;

      setCargandoCliente(true);
      setClienteSeleccionado(null);
      setModoRegistro(false);
      
      const isCC = !isNaN(Number(query)) && query.length > 5;
      const url = isCC 
          ? `/terceros_by_cc/${query}` 
          : `/terceros_by_telefono/${query}`;

      try {
          const response = await axios.get(url);
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
              enqueueSnackbar('Cliente no encontrado. Por favor, registre los datos.', { variant: 'info' });
              setModoRegistro(true);
              
              setClienteNuevo(prev => ({ 
                  ...prev, 
                  documento: query, 
                  identificacion: query, 
                  celular: isCC ? '' : query,
                  nombre1: '', 
                  apellido1: '', 
              }));
          }
      } catch (error) {
          enqueueSnackbar('Error al buscar cliente. Registre los datos.', { variant: 'error' });
          setModoRegistro(true);
          setClienteNuevo(prev => ({ 
            ...prev, 
            documento: query, 
            identificacion: query,
            celular: query,
          }));
      } finally {
          setCargandoCliente(false);
      }
  };
  
  const handleSaveClienteYReserva = async (): Promise<Cliente | null> => {
      if (clienteSeleccionado) {
          return clienteSeleccionado;
      } 
      
      if (modoRegistro) {
          const { nombre1, apellido1, documento } = clienteNuevo;
          if (!nombre1 || !apellido1 || !documento) {
              enqueueSnackbar('Debe completar el nombre, apellido y documento del nuevo cliente.', { variant: 'warning' });
              return null;
          }

          try {
              const dataToSend = {
                  ...clienteNuevo,
                  identificacion: clienteNuevo.documento, 
              };

              const response = await axios.post('/store_person_tercero', dataToSend);
              
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
      
      enqueueSnackbar('Debe buscar un cliente o registrar uno nuevo.', { variant: 'warning' });
      return null;
  }
  
 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
        if (name === 'prestadorId') {
            return { ...prev, prestadorId: value, servicioId: '' };
        }
        return { ...prev, [name]: value };
    });
  };

  const handleNuevoClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const cliente = await handleSaveClienteYReserva();
    if (!cliente) return;
    
    onGuardar({
      hora: formData.hora,
      cliente: cliente.nombreCompleto, 
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
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
      <h2 className="mb-2 text-xl font-semibold">Nueva reserva — {fechaString}</h2>

      {/* Hora */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">Hora:</label>
        <input
          type="time"
          name="hora"
          value={formData.hora}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded-lg"
          required
        />
      </div>

      {/* Prestador */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">Prestador/Doctor:</label>
        <select
          name="prestadorId"
          value={formData.prestadorId}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded-lg"
          required
        >
           <option value="">Seleccione un prestador</option>
           {prestadores.map((p) => (
               <option key={p.id} value={p.id.toString()}> 
                   {p.nombreCompleto} 
               </option>
           ))}
        </select>
      </div>

      {/* Servicio */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">Servicio:</label>
        <select
          name="servicioId"
          value={formData.servicioId}
          onChange={handleChange}
          disabled={!prestadorSeleccionado}
          className="p-2 border border-gray-300 rounded-lg"
          required
        >
          <option value="">
            {prestadorSeleccionado ? 'Seleccione un servicio' : 'Seleccione un prestador primero'}
          </option>
          {serviciosDisponibles.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* CAMPO DE BÚSQUEDA Y REGISTRO DE CLIENTE */}
      <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Cliente (Buscar por Doc/Tel):</label>
          <div className="flex space-x-2">
              <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Documento o Teléfono"
                  className="flex-grow p-2 border border-gray-300 rounded-lg"
                  disabled={!!clienteSeleccionado || cargandoCliente}
              />
              <button
                  type="button"
                  onClick={() => handleSearchCliente(searchQuery)}
                  disabled={!searchQuery || !!clienteSeleccionado || cargandoCliente}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                  {cargandoCliente ? 'Buscando...' : 'Buscar'}
              </button>
          </div>
      </div>
      
      {/* Resultado de la Búsqueda / Cliente Seleccionado */}
      {clienteSeleccionado && (
          <div className="p-3 mt-1 border border-green-400 rounded-lg bg-green-50">
              <p className="font-semibold text-green-800">✅ Cliente Seleccionado:</p>
              
        <p className="text-lg font-bold text-blue-400"> 
            {clienteSeleccionado.nombreCompleto} 
            {clienteSeleccionado.documento && ` (Doc: ${clienteSeleccionado.documento})`}
        </p>

        <div className="text-sm text-gray-700">
            {clienteSeleccionado.telefono && (
                <p>📞 Teléfono: {clienteSeleccionado.telefono}</p>
            )}
            {clienteSeleccionado.email && (
                <p>📧 Correo: {clienteSeleccionado.email}</p>
            )}
        </div>
              <button 
                  type="button" 
                  onClick={() => { setClienteSeleccionado(null); setModoRegistro(false); setSearchQuery(''); }} 
                  className="mt-1 text-sm text-red-500 hover:text-red-700"
              >
                  Deshacer selección
              </button>
          </div>
      )}

      {/* Formulario de Registro si NO ENCONTRADO */}
      {modoRegistro && !clienteSeleccionado && (
          <div className="p-4 mt-1 space-y-3 border border-orange-400 rounded-lg bg-orange-50">
              <p className="font-semibold text-orange-800">⚠️ Cliente no encontrado. Ingrese datos para registrar:</p>
              
              <input type="text" placeholder="Primer Nombre" name="nombre1" required
                  value={clienteNuevo.nombre1}
                  onChange={handleNuevoClienteChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <input type="text" placeholder="Primer Apellido" name="apellido1" required
                  value={clienteNuevo.apellido1}
                  onChange={handleNuevoClienteChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <input type="text" placeholder="Documento" name="documento" required
                  value={clienteNuevo.documento}
                  onChange={handleNuevoClienteChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <input type="text" placeholder="Teléfono/Celular" name="celular"
                  value={clienteNuevo.celular}
                  onChange={handleNuevoClienteChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <input type="email" placeholder="Email" name="email"
                  value={clienteNuevo.email}
                  onChange={(e) => setClienteNuevo(p => ({...p, email: e.target.value}))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
              />
          </div>
      )}
      
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

      <div className="flex justify-end pt-2 space-x-3 actions">
        <button type="button" onClick={onCancelar} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
            Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            Guardar Reserva
        </button>
      </div>
    </form>
  );
};

export default ReservaForm;