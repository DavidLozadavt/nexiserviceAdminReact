import { useState } from "react";
import { validateReservation } from "./ValidacionFechaHora"; 
type ReservaFormProps = any; // Usar el tipo real de tu archivo types.

export function ReservaForm({
  fechaSeleccionada,
  onGuardar,
  onCancelar,
}: ReservaFormProps) {
  const [hora, setHora] = useState("07:00"); 
  const [cliente, setCliente] = useState("");
  const [error, setError] = useState<string | null>(null); 

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 

    if (!hora || !cliente) {
      return;
    }
    
    const invalidReason = validateReservation(fechaSeleccionada, hora);

    if (invalidReason) {
        setError(invalidReason);
        return; // Detiene el envío si hay error
    }

    // Si todo es válido
    onGuardar(hora, cliente);
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

      <div>
        <label className="block mb-1 text-gray-600">Hora:</label>
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
          //  Restricción a nivel UI para el horario de 7:00 AM a 4:59 PM
          min="07:00"
          max="16:59"
          step="300" // Opcional: pasos de 5 minutos
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-600">Cliente:</label>
        <input
          type="text"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="Nombre del cliente"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="flex justify-end gap-3">
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