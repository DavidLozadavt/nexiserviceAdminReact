import { useState } from "react";

const ReservaForm = ({
  fechaSeleccionada,
  onGuardar,
  onCancelar,
}: {
  fechaSeleccionada: Date;
  onGuardar: (hora: string, cliente: string) => void;
  onCancelar: () => void;
}) => {
  const [hora, setHora] = useState("");
  const [cliente, setCliente] = useState("");

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hora || !cliente) {
      alert("Por favor completa todos los campos");
      return;
    }
    onGuardar(hora, cliente);
    setHora("");
    setCliente("");
  };

  return (
    <div className="mt-6 p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-lg font-semibold mb-3">
        Nueva reserva para {fechaSeleccionada.toLocaleDateString()}
      </h2>

      <form onSubmit={manejarSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Hora (ej. 10:00 AM)"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          type="text"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservaForm;
