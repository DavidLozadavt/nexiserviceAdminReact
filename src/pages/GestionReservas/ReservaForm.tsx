// ReservaForm.tsx

import { useState, useMemo, useEffect } from "react";
import { ReservaFormProps, Prestador, Servicio } from "./types";
import { validateReservation } from "./ValidacionFechaHora"; 

export function ReservaForm({
  fechaSeleccionada,
  onGuardar,
  onCancelar,
  prestadores, // Recibido por props
}: ReservaFormProps) {
  const [hora, setHora] = useState("07:00");
  const [cliente, setCliente] = useState("");
  // Usamos el ID del primer prestador como valor inicial
  const [prestadorId, setPrestadorId] = useState<number | string>(prestadores[0]?.id || "");
  const [servicioId, setServicioId] = useState<number | string>("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null); 

  // 1. Encontrar el prestador seleccionado (basado en el ID)
  const prestadorSeleccionado: Prestador | undefined = useMemo(() => {
    // Usamos Number(prestadorId) para asegurar la comparación si prestadorId es string
    return prestadores.find(p => p.id === Number(prestadorId)); 
  }, [prestadorId, prestadores]);
  
  // 2. Obtener los servicios asociados al prestador seleccionado
  const serviciosDisponibles: Servicio[] = prestadorSeleccionado?.servicios || [];

  // 3. Efecto para inicializar el servicio o resetearlo si el prestador cambia
  useEffect(() => {
    // Si hay servicios disponibles
    if (serviciosDisponibles.length > 0) {
      // Si el servicio actual no está en la lista del nuevo prestador, o si no hay servicio seleccionado
      if (servicioId === "" || !serviciosDisponibles.some(s => s.id === servicioId)) {
        setServicioId(serviciosDisponibles[0].id);
      }
    } else {
      setServicioId("");
    }
    // Aseguramos que solo se inicialice al cargar o al cambiar el prestador/servicios
  }, [prestadorId, serviciosDisponibles, servicioId]); 

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 

    if (!hora || !cliente || !prestadorId || !servicioId || !motivo) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }
    // Ejecutar la validación (Domingo, Horario, Pasado)
    const invalidReason = validateReservation(fechaSeleccionada, hora);

    if (invalidReason) {
      setError(invalidReason); 
      return; 
    }

    // Obtener los nombres finales para la reserva
    const nombrePrestador = `${prestadorSeleccionado?.persona.nombre1} ${prestadorSeleccionado?.persona.apellido1}` || 'Desconocido';
    const nombreServicio = serviciosDisponibles.find(s => s.id === servicioId)?.nombre || 'Desconocido';

    onGuardar({ 
      hora, 
      cliente, 
      servicio: nombreServicio, 
      prestador: nombrePrestador, 
      motivo 
    });
  };

  return (
    <form onSubmit={manejarSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Nueva reserva —{" "}
        <span className="text-indigo-600">
          {fechaSeleccionada.toLocaleDateString()}
        </span>
      </h3>

      {/* Bloque para mostrar el mensaje de error */}
      {error && (
        <p className="p-3 text-sm font-medium text-red-700 bg-red-100 border-l-4 border-red-500 rounded">
          {error}
        </p>
      )}

      {/* CONTENEDOR DE DOS COLUMNAS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 1. Campo Fecha (Ocupa una columna) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">Fecha:</label>
          <input
            type="text"
            value={fechaSeleccionada.toLocaleDateString()}
            className="w-full p-2 text-sm bg-gray-100 border rounded-lg cursor-not-allowed"
            disabled
          />
        </div>
        
        {/* 2. Campo Hora (Ocupa una columna) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">Hora:</label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
            min="07:00"
            max="16:59"
          />
        </div>

        {/* 3. Campo Prestador (Ocupa una columna) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">Prestador/Doctor:</label>
          <select
            value={prestadorId}
            // Usamos Number() para asegurar que el ID sea numérico
            onChange={(e) => setPrestadorId(Number(e.target.value))} 
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          >
            {prestadores.map(p => (
              <option key={p.id} value={p.id}>
                {p.persona.nombreCompleto || `${p.persona.nombre1} ${p.persona.apellido1}`}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Campo Servicio (Ocupa una columna, EN CASCADA) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">Servicio:</label>
          <select
            value={servicioId}
            onChange={(e) => setServicioId(Number(e.target.value))}
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
            disabled={serviciosDisponibles.length === 0}
          >
            {serviciosDisponibles.length > 0 ? (
              serviciosDisponibles.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))
            ) : (
              <option value="">No hay servicios disponibles</option>
            )}
          </select>
        </div>

        {/* 5. Campo Cliente (Ocupa una columna) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">Cliente:</label>
          <input
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Nombre completo del paciente"
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        
        {/* 6. Campo Motivo de Consulta (OCUPA DOS COLUMNAS) */}
        <div className="md:col-span-2"> 
          <label className="block mb-1 text-sm font-medium text-gray-600">Motivo de Consulta:</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej: Dolor abdominal, chequeo de rutina, etc."
            rows={3}
            className="w-full p-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
      </div> {/* Fin del Contenedor de Dos Columnas */}


      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
export default ReservaForm;