import { useState } from "react";
import ReservaForm from "./ReservaForm";

const CalendarioReservas = () => {
  const [reservas, setReservas] = useState<{ fecha: string; hora: string; cliente: string }[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [vista, setVista] = useState<"mes" | "semana">("mes");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const hoy = new Date();

  const año = fechaSeleccionada?.getFullYear() ?? hoy.getFullYear();
  const mes = fechaSeleccionada?.getMonth() ?? hoy.getMonth();

  const cambiarMes = (offset: number) => {
    const nuevaFecha = new Date(año, mes + offset, 1);
    setFechaSeleccionada(nuevaFecha);
    setMostrarFormulario(false);
  };

  const generarDiasMes = () => {
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const dias = [];
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(new Date(año, mes, i));
    }
    return dias;
  };

  const generarDiasSemana = () => {
    const inicioSemana = new Date(fechaSeleccionada ?? hoy);
    inicioSemana.setDate((fechaSeleccionada ?? hoy).getDate() - (fechaSeleccionada ?? hoy).getDay());
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicioSemana);
      d.setDate(inicioSemana.getDate() + i);
      dias.push(d);
    }
    return dias;
  };

  const manejarClickDia = (fecha: Date) => {
    setFechaSeleccionada(fecha);
    setMostrarFormulario(true);
  };

  const manejarGuardarReserva = (hora: string, cliente: string) => {
    if (!fechaSeleccionada) return;
    const fechaISO = fechaSeleccionada.toISOString().split("T")[0];
    setReservas([...reservas, { fecha: fechaISO, hora, cliente }]);
    setMostrarFormulario(false);
  };

  const manejarCancelar = () => {
    setMostrarFormulario(false);
  };

  const fechaActualISO = fechaSeleccionada ? fechaSeleccionada.toISOString().split("T")[0] : "";
  const reservasDia = reservas.filter((r) => r.fecha === fechaActualISO);
  const dias = vista === "mes" ? generarDiasMes() : generarDiasSemana();
  const nombreMes = (fechaSeleccionada ?? hoy).toLocaleString("es-ES", { month: "long" });

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        📅 Calendario de Reservas
      </h1>

      {/* Barra superior */}
      <div className="flex flex-wrap justify-between items-center mb-4 bg-white shadow-sm rounded-lg p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => cambiarMes(-1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold capitalize">
            {nombreMes} {año}
          </h2>
          <button
            onClick={() => cambiarMes(1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            →
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setVista("mes")}
            className={`px-3 py-1 rounded ${vista === "mes" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            Mes
          </button>
          <button
            onClick={() => setVista("semana")}
            className={`px-3 py-1 rounded ${vista === "semana" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Días */}
      <div className={`${vista === "mes" ? "grid grid-cols-7" : "grid grid-cols-7"} gap-2`}>
        {dias.map((dia) => {
          const fechaISO = dia.toISOString().split("T")[0];
          const tieneReserva = reservas.some((r) => r.fecha === fechaISO);
          const esHoy = fechaISO === new Date().toISOString().split("T")[0];
          const esSeleccionada =
            fechaSeleccionada && fechaISO === fechaSeleccionada.toISOString().split("T")[0];

          return (
            <button
              key={fechaISO}
              onClick={() => manejarClickDia(dia)}
              className={`p-4 rounded-lg border text-sm transition-all duration-200 ${
                esSeleccionada
                  ? "bg-blue-600 text-white"
                  : tieneReserva
                  ? "bg-green-100 text-green-900 border-green-300"
                  : "bg-white hover:bg-blue-50"
              } ${esHoy ? "ring-2 ring-blue-400" : ""}`}
            >
              <div className="font-semibold">{dia.getDate()}</div>
            </button>
          );
        })}
      </div>

      {/* Detalles */}
      {fechaSeleccionada && (
        <div className="mt-6">
          <div className="p-4 border rounded-lg shadow-md bg-white">
            <h2 className="text-lg font-semibold mb-2">
              Reservas del {fechaSeleccionada.toLocaleDateString()}
            </h2>

            {reservasDia.length === 0 ? (
              <p className="text-gray-500">No hay reservas para este día.</p>
            ) : (
              <ul className="space-y-2">
                {reservasDia.map((r, i) => (
                  <li
                    key={i}
                    className="p-2 bg-gray-50 rounded-md border flex justify-between"
                  >
                    <span>{r.hora}</span>
                    <span>{r.cliente}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* MODAL para ReservaForm */}
{mostrarFormulario && fechaSeleccionada && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative animate-fadeIn">
      <button
        onClick={manejarCancelar}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
      >
        ✕
      </button>
      <ReservaForm
        fechaSeleccionada={fechaSeleccionada}
        onGuardar={manejarGuardarReserva}
        onCancelar={manejarCancelar}
      />
    </div>
  </div>
)}

    </div>
  );
};

export default CalendarioReservas;
