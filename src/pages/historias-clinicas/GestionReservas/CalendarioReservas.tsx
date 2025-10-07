import React, { useState } from "react";

interface Reserva {
  fecha: string;
  hora: string;
  cliente: string;
}

type Vista = "mes" | "semana" | "dia";

const CalendarioReservas: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [vista, setVista] = useState<Vista>("mes");

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const año = fechaSeleccionada.getFullYear();
  const mes = fechaSeleccionada.getMonth();

  // Cambiar mes
  const cambiarMes = (offset: number) => {
    const nuevaFecha = new Date(año, mes + offset, 1);
    setFechaSeleccionada(nuevaFecha);
  };

  // Genera los días del mes actual
  const generarDiasMes = () => {
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const dias = [];
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(new Date(año, mes, i));
    }
    return dias;
  };

  // Genera los días de la semana actual
  const generarDiasSemana = () => {
    const inicioSemana = new Date(fechaSeleccionada);
    inicioSemana.setDate(fechaSeleccionada.getDate() - fechaSeleccionada.getDay());
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
  };

  const manejarCrearReserva = () => {
    const hora = prompt("Ingrese hora (ej. 10:00 AM)");
    const cliente = prompt("Ingrese nombre del cliente");
    if (hora && cliente) {
      const fechaISO = fechaSeleccionada.toISOString().split("T")[0];
      setReservas([...reservas, { fecha: fechaISO, hora, cliente }]);
    }
  };

  const fechaActualISO = fechaSeleccionada.toISOString().split("T")[0];
  const reservasDia = reservas.filter((r) => r.fecha === fechaActualISO);

  const dias =
    vista === "mes"
      ? generarDiasMes()
      : vista === "semana"
      ? generarDiasSemana()
      : [fechaSeleccionada];

  const nombreMes = fechaSeleccionada.toLocaleString("es-ES", { month: "long" });

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
            className={`px-3 py-1 rounded ${
              vista === "mes" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setVista("semana")}
            className={`px-3 py-1 rounded ${
              vista === "semana" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setVista("dia")}
            className={`px-3 py-1 rounded ${
              vista === "dia" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Día
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      {vista !== "dia" && (
        <div className="grid grid-cols-7 gap-2 text-center font-semibold mb-2 text-gray-700">
          {diasSemana.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
      )}

      {/* Cuadrícula de días */}
      <div
        className={`${
          vista === "mes"
            ? "grid grid-cols-7"
            : vista === "semana"
            ? "grid grid-cols-7"
            : "grid grid-cols-1"
        } gap-2`}
      >
        {dias.map((dia) => {
          const fechaISO = dia.toISOString().split("T")[0];
          const tieneReserva = reservas.some((r) => r.fecha === fechaISO);
          const esHoy = fechaISO === new Date().toISOString().split("T")[0];
          return (
            <button
              key={fechaISO}
              onClick={() => manejarClickDia(dia)}
              className={`p-4 rounded-lg border text-sm transition-all duration-200 ${
                fechaISO === fechaActualISO
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

      {/* Detalles del día */}
      <div className="mt-6 p-4 border rounded-lg shadow-md bg-white">
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
        <button
          onClick={manejarCrearReserva}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Crear Reserva
        </button>
      </div>
    </div>
  );
};

export default CalendarioReservas;
