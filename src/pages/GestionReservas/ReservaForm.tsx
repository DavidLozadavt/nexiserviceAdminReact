import React, { useState, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { Prestador, ReservaFormProps } from "./types";


export const ReservaForm = ({
  fechaSeleccionada,
  prestadores, 
  onCancelar,
  onGuardar
}: ReservaFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
   

  const [formData, setFormData] = useState({
    prestadorId: '',
    servicioId: '',
    cliente: '',
    hora: '',
    motivo: '',
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


  // Manejo de cambio en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
        // Si el usuario cambia el prestador, reseteamos el servicio
        if (name === 'prestadorId') {
            return { ...prev, prestadorId: value, servicioId: '' };
        }
        return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!prestadorSeleccionado || !servicioSeleccionado || !formData.hora || !formData.cliente) {
        enqueueSnackbar('Debe completar los campos obligatorios.', { variant: 'warning' });
        return;
    }

    onGuardar({
      hora: formData.hora,
      cliente: formData.cliente,
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
          disabled={!prestadorSeleccionado} // Deshabilitado hasta que se elija un prestador
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

      {/* Cliente */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">Cliente:</label>
        <input
          type="text"
          name="cliente"
          value={formData.cliente}
          onChange={handleChange}
          placeholder="Nombre completo del paciente"
          className="p-2 border border-gray-300 rounded-lg"
          required
        />
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