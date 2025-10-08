import { useState, useCallback, useMemo } from "react";
import ReservaForm from "./ReservaForm";
import { Reserva } from "./types";

type Vista = "mensual" | "semanal";
const LIMITE_RESERVAS_VISIBLES = 5;

const HOY = new Date(); 

export default function CalendarioReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(HOY); 
  const [vista, setVista] = useState<Vista>("mensual"); 
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarTodasLasReservas, setMostrarTodasLasReservas] = useState(false); 
  // Estado para el mes y año que estamos viendo
  const [mesActual, setMesActual] = useState<Date>(HOY); 

  
  // Lógica para determinar si el mes visible es el mes actual
  const esMesPresente = useMemo(() => {
    return mesActual.getFullYear() === HOY.getFullYear() &&
           mesActual.getMonth() === HOY.getMonth();
  }, [mesActual]);


  // 📅 Generar los días del mes visible
  const diasDelMes = useMemo(() => {
    const primerDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    const numDiasDelMes = ultimoDiaDelMes.getDate();

    return Array.from({ length: numDiasDelMes }, (_, i) => {
      const dia = new Date(primerDiaDelMes);
      dia.setDate(i + 1);
      return dia;
    });
  }, [mesActual]); // Se recalcula al cambiar 'mesActual'

  const diasVisibles = vista === "semanal" ? diasDelMes.slice(0, 7) : diasDelMes;

  const nombreDelMes = mesActual.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  });

  const tieneReserva = useCallback((dia: Date): boolean => {
    return reservas.some(
      (reserva) =>
        new Date(reserva.fecha).toDateString() === dia.toDateString()
    );
  }, [reservas]);

  // 🆕 Función para chequear si un día es HOY
  const esHoy = (dia: Date): boolean => {
    return esMesPresente && dia.toDateString() === HOY.toDateString();
  };


  // --- Funciones de Navegación de Meses ---
  const navegarMes = (offset: number) => {
    setMesActual(prevMes => {
      const nuevoMes = new Date(prevMes);
      nuevoMes.setMonth(prevMes.getMonth() + offset);
      
      const esNuevoMesPresente = 
        nuevoMes.getFullYear() === HOY.getFullYear() &&
        nuevoMes.getMonth() === HOY.getMonth();

      // 🛑 Al navegar al mes presente, se selecciona HOY
      if (esNuevoMesPresente) {
        setFechaSeleccionada(HOY);
      } else {
        // Al navegar a otro mes, se selecciona el día 1 de ese mes
        setFechaSeleccionada(new Date(nuevoMes.getFullYear(), nuevoMes.getMonth(), 1));
      }

      setMostrarTodasLasReservas(false);
      return nuevoMes;
    });
  };

  const irMesAnterior = () => navegarMes(-1);
  const irMesSiguiente = () => navegarMes(1);
  // ------------------------------------------


  const manejarCambioVista = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVista(e.target.value as Vista);
  };

  const manejarClickDia = (fecha: Date) => {
    setFechaSeleccionada(fecha);
    setMostrarTodasLasReservas(false); 
  };
  
  const manejarNuevaReserva = () => {
      setMostrarFormulario(true);
  };

  const manejarGuardar = (hora: string, cliente: string) => {
    const nuevaReserva: Reserva = {
      fecha: new Date(fechaSeleccionada.setHours(0, 0, 0, 0)).toISOString(), 
      hora,
      cliente,
    };
    setReservas([...reservas, nuevaReserva]);
    setMostrarFormulario(false);
  };

  const manejarCancelar = () => setMostrarFormulario(false);
  
  // 1. Filtrar las reservas para el día seleccionado
  const reservasDelDiaSeleccionado = useMemo(() => {
    return reservas.filter(
        (reserva) =>
          new Date(reserva.fecha).toDateString() === fechaSeleccionada.toDateString()
      );
  }, [reservas, fechaSeleccionada]);
  
  // 2. Determinar qué reservas mostrar (Ver más/menos)
  const reservasVisibles = mostrarTodasLasReservas
    ? reservasDelDiaSeleccionado
    : reservasDelDiaSeleccionado.slice(0, LIMITE_RESERVAS_VISIBLES);

  const hayMasReservas = reservasDelDiaSeleccionado.length > LIMITE_RESERVAS_VISIBLES;
  
  const toggleMostrarReservas = () => {
    setMostrarTodasLasReservas(!mostrarTodasLasReservas);
  };


  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold text-gray-800">
        Calendario de Reservas
      </h2>

      {/* Controles de Vista y Botón Nueva Reserva */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-3">
            <button
                onClick={manejarNuevaReserva}
                className="px-4 py-2 text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
                ➕ Nueva Reserva
            </button>
        </div>
        
        {/* Selector de Vista */}
        <div className="flex items-center space-x-2">
            <label htmlFor="vista-selector" className="text-gray-600">Vista:</label>
            <select
                id="vista-selector"
                value={vista}
                onChange={manejarCambioVista}
                className="px-3 py-2 bg-white border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="mensual">Mensual</option>
                <option value="semanal">Semanal</option>
            </select>
        </div>
      </div>
      
      {/* 📅 Navegación de Meses */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={irMesAnterior}
          className="p-2 text-gray-700 transition-colors rounded-full hover:bg-gray-200"
          aria-label="Mes anterior"
        >
          &lt;
        </button>
        
        <h3 className="text-xl font-semibold text-gray-800 capitalize">
          {nombreDelMes} 
        </h3>

        <button
          onClick={irMesSiguiente}
          className="p-2 text-gray-700 transition-colors rounded-full hover:bg-gray-200"
          aria-label="Mes siguiente"
        >
          &gt;
        </button>
      </div>


      {/* Calendario  */}
      <div
        className={`grid grid-cols-7 gap-3 mb-6`}
      >
        <div className="text-sm font-bold text-center text-gray-500">Dom</div>
        <div className="text-sm font-bold text-center text-gray-500">Lun</div>
        <div className="text-sm font-bold text-center text-gray-500">Mar</div>
        <div className="text-sm font-bold text-center text-gray-500">Mié</div>
        <div className="text-sm font-bold text-center text-gray-500">Jue</div>
        <div className="text-sm font-bold text-center text-gray-500">Vie</div>
        <div className="text-sm font-bold text-center text-gray-500">Sáb</div>

        {diasVisibles.map((dia) => {
          const esSeleccionado =
            fechaSeleccionada.toDateString() === dia.toDateString();
          const hayReserva = tieneReserva(dia);
          const diaEsHoy = esHoy(dia); // Comprobar si es HOY

          return (
            <div
              key={dia.toISOString()}
              onClick={() => manejarClickDia(dia)}
              className={`flex flex-col items-center justify-center cursor-pointer transition-all p-2 h-12 relative rounded-lg 
                      border-2 ${
                        // Resaltar HOY con un borde diferente
                        diaEsHoy 
                          ? "border-indigo-300 bg-indigo-50" 
                          : "bg-gray-100 hover:bg-gray-200 border-gray-200"
                      } text-gray-800`}
            >
              {/* Círculo del día */}
              <div
                className={`flex items-center justify-center w-10 h-10 font-semibold text-lg transition-all 
                ${
                  esSeleccionado
                    ? "bg-blue-600 text-white rounded-full shadow-md"
                    
                
                  : hayReserva
                    ? "text-green-600" 
                    
                
                  : diaEsHoy
                    ? "text-indigo-600"

                  : "text-gray-800"
                }
                ${
                  
                  !esSeleccionado ? "" : "rounded-full shadow-md"
                }
                `}
              >
                {dia.getDate().toString()}
              </div>
            </div>
          );
        })}

      </div>

      {/* Modal para el Formulario de reserva  */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 transition-all transform scale-100 bg-white border shadow-2xl rounded-xl">
            <ReservaForm
              fechaSeleccionada={fechaSeleccionada}
              onGuardar={manejarGuardar}
              onCancelar={manejarCancelar}
            />
          </div>
        </div>
      )}

      {/* Lista de reservas */}
      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold">
          Reservas para el {fechaSeleccionada.toLocaleDateString()}
        </h3>
        
        {reservasDelDiaSeleccionado.length === 0 ? (
          <p className="text-gray-500">
            No hay reservas para el día seleccionado.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {reservasVisibles.map((r, i) => ( 
                <li
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <span>
                    ⏰ {r.hora}
                  </span>
                  <span className="font-medium text-gray-800">{r.cliente}</span>
                </li>
              ))}
            </ul>

            {/* Botón "Ver más/menos" */}
            {hayMasReservas && (
              <button
                onClick={toggleMostrarReservas}
                className="w-full py-2 mt-3 text-sm font-medium text-blue-600 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
              >
                {mostrarTodasLasReservas ? "Ver menos (Mostrar solo 5)" : `Ver más (${reservasDelDiaSeleccionado.length - LIMITE_RESERVAS_VISIBLES} adicionales)`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}