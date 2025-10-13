import axios, { AxiosResponse } from 'axios';
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { ReservaForm } from "./ReservaForm"; 
import { Reserva, Prestador, Servicio, CalendarioReservasProps, AgendaResponse } from "./types"; 

// --- Variables y Funciones Auxiliares ---
type Vista = "mensual" | "semanal";
const LIMITE_RESERVAS_VISIBLES = 3;
const HOY = new Date(); 

// TS2366 Corrección: Eliminamos la anotación de tipo explícita
const calcularSemanaDeHoy = () => { 
    const diaIndex = HOY.getDate() - 1; 
    return Math.floor(diaIndex / 7);
};


// --- Funciones de Carga de Datos ---

const fetchReservas = async (idCompany: number): Promise<Reserva[]> => {
    console.log("🛠️ Iniciar carga de reservas para Company ID:", idCompany);
    try {
        const response: AxiosResponse<AgendaResponse[]> = await axios.get(
            `/agendas` 
        );
        
        const rawAgendas = response.data;
        
        console.log("✅ API Raw Response (rawAgendas):", rawAgendas); 
        
        // FILTRO DOBLE ESTRICTO
        const agendasConDatosValidos = rawAgendas
            .filter(agenda => 
                agenda.fechaInicial && 
                agenda.asignaciones_responsables && 
                agenda.asignaciones_responsables.length > 0
            );
        
        console.log("✅ Agendas Filtradas (agendasConDatosValidos):", agendasConDatosValidos);

        const reservasMapeadas: Reserva[] = agendasConDatosValidos
            .map(agenda => {
                
                const asignacion = agenda.asignaciones_responsables[0];
                const responsable = asignacion.responsable;
                const cliente = asignacion.cliente;
                const servicio = asignacion.servicio;
                
                // VALIDACIÓN DE OBJETOS ANIDADOS
                if (!responsable || !cliente || !servicio) {
                    console.error(
                        "❌ FALLO DE MAPEO: Asignación incompleta para Agenda ID:", 
                        agenda.id, 
                        "Asignacion:", asignacion
                    );
                    return null; 
                }

                const nombrePrestador = `${responsable.nombre1 || ''} ${responsable.apellido1 || ''}`.trim();
                
                return {
                    fecha: agenda.fechaInicial!, 
                    hora: agenda.horaInicial || '00:00:00', 
                    motivo: agenda.nota || 'Sin motivo',
                    cliente: cliente.nombre || `Cliente Desconocido`,
                    servicio: servicio.nombre || `Servicio Desconocido`,
                    prestador: nombrePrestador,
                } as Reserva;
            })
            // Filtrar nulls
            .filter((reserva): reserva is Reserva => reserva !== null); 

        console.log("✅ Reservas Mapeadas (Listado Final):", reservasMapeadas);

        return reservasMapeadas;
        
    } catch (error) {
        console.error("❌ Error al cargar las reservas desde la API:", error);
        return []; 
    }
};


const fetchPrestadores = async (idCompany: number): Promise<Prestador[]> => {
    try {
        const response: AxiosResponse<Prestador[]> = await axios.get(
            `/get_prestadores_company/${idCompany}`
        );
        
       
        const rawPrestadores = response.data;

        const processedPrestadores: Prestador[] = rawPrestadores.map(prestador => {
            const persona = prestador.persona;
            
            const nombre1 = persona?.nombre1 || '';
            const apellido1 = persona?.apellido1 || '';
            const nombreCompletoGenerado = `${nombre1} ${apellido1}`.trim();
            
            const nombreFinal = nombreCompletoGenerado || `Prestador ID ${prestador.id}`;

            return {
                ...prestador,
                nombreCompleto: nombreFinal, 
                persona: {
                    ...persona, 
                    nombreCompleto: nombreFinal 
                }
            } as Prestador; 
        });

        return processedPrestadores;
        
    } catch (error) {
        console.error("❌ Error al cargar prestadores desde la API:", error);
        return []; 
    }
};

// -----------------------------------------------------------------------------------

export default function CalendarioReservas({ idCompany }: CalendarioReservasProps) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(HOY); 
  const [vista, setVista] = useState<Vista>("mensual"); 
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarTodasLasReservas, setMostrarTodasLasReservas] = useState(false); 
  const [mesActual, setMesActual] = useState<Date>(HOY); 
  const [indiceSemana, setIndiceSemana] = useState(calcularSemanaDeHoy()); 

  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [cargandoPrestadores, setCargandoPrestadores] = useState(true);

  
  const loadReservas = useCallback(async () => {
    if (!idCompany) { 
        console.error("ID de empresa no proporcionado. No se pueden cargar reservas.");
        return;
    }
    
    try {
        const data = await fetchReservas(idCompany); 
        setReservas(data);
    } catch (error) {
        console.error("Error al cargar reservas:", error);
    }
  }, [idCompany]);


  useEffect(() => {
    loadReservas();
  }, [idCompany, loadReservas]); 


  useEffect(() => {
    if (!idCompany) { 
        console.error("ID de empresa no proporcionado. No se pueden cargar prestadores.");
        setCargandoPrestadores(false);
        return;
    }
    
    setCargandoPrestadores(true); 

    const loadPrestadores = async () => {
        try {
            const data = await fetchPrestadores(idCompany); 
            setPrestadores(data);
        } catch (error) {
            console.error("Error al cargar prestadores:", error);
        } finally {
            setCargandoPrestadores(false);
        }
    };
    loadPrestadores();
  }, [idCompany]); 


  
  const esMesPresente = useMemo(() => {
    return mesActual.getFullYear() === HOY.getFullYear() &&
           mesActual.getMonth() === HOY.getMonth();
  }, [mesActual]);


  
  const diasDelMesCompleto = useMemo(() => {
    const primerDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    const numDiasDelMes = ultimoDiaDelMes.getDate();

    const offset = primerDiaDelMes.getDay(); 

    const dias = Array.from({ length: numDiasDelMes }, (_, i) => {
      const dia = new Date(primerDiaDelMes);
      dia.setDate(i + 1);
      return dia;
    });
    
    const paddingInicial = Array(offset).fill(null); 

    return [...paddingInicial, ...dias];
  }, [mesActual]);

  const diasVisibles = useMemo(() => {
      if (vista === "mensual") {
          return diasDelMesCompleto;
      }

      const inicio = indiceSemana * 7;
      const fin = inicio + 7;

      return diasDelMesCompleto.slice(inicio, fin) as (Date | null)[]; 
  }, [vista, diasDelMesCompleto, indiceSemana]);

  const totalSemanas = Math.ceil(diasDelMesCompleto.length / 7);

  const nombreDelMes = mesActual.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Lógica de marcaje del calendario (usa zona horaria segura)
  const tieneReserva = useCallback((dia: Date): boolean => {
    return reservas.some(
      (reserva) => {
            const [year, month, day] = reserva.fecha.split('-').map(Number);
            // Crea una fecha local basada en los componentes YYYY, MM-1, DD
            const fechaReservaLocal = new Date(year, month - 1, day); 
            
            return fechaReservaLocal.toDateString() === dia.toDateString();
      }
    );
  }, [reservas]);

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

      if (esNuevoMesPresente) {
        setFechaSeleccionada(HOY);
        setIndiceSemana(calcularSemanaDeHoy()); 
      } else {
        setFechaSeleccionada(new Date(nuevoMes.getFullYear(), nuevoMes.getMonth(), 1));
        setIndiceSemana(0);
      }

      setMostrarTodasLasReservas(false);
      return nuevoMes;
    });
  };

  const irMesAnterior = () => navegarMes(-1);
  const irMesSiguiente = () => navegarMes(1);
  // ------------------------------------------

  // --- Funciones de Navegación de Semanas ---
  const irSemanaAnterior = () => {
    if (indiceSemana > 0) {
        setIndiceSemana(prev => prev - 1);
    }
  };

  const irSemanaSiguiente = () => {
    if (indiceSemana + 1 < totalSemanas) {
        setIndiceSemana(prev => prev + 1);
    }
  };

  const manejarCambioVista = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaVista = e.target.value as Vista;
    
    if (nuevaVista === 'semanal') {
        const semanaInicial = esMesPresente ? calcularSemanaDeHoy() : 0;
        setIndiceSemana(semanaInicial); 
    } else {
        setIndiceSemana(0); 
    }
    setVista(nuevaVista);
  };

  const manejarClickDia = (dia: Date | null) => {
    if (dia) {
      setFechaSeleccionada(dia);
      setMostrarTodasLasReservas(false); 
    }
  };
  
  const manejarNuevaReserva = () => {
      if (cargandoPrestadores) {
          alert("Cargando datos de prestadores, por favor espera.");
          return;
      }
      if (prestadores.length === 0) {
          alert("No hay prestadores disponibles para reservar.");
          return;
      }
      if (fechaSeleccionada.getDay() === 0) {
          alert("No se pueden hacer reservas los domingos.");
          return;
      }
      setMostrarFormulario(true);
  };

  const manejarReservaGuardada = () => {
    setMostrarFormulario(false);
    loadReservas(); 
  };

  const manejarCancelar = () => setMostrarFormulario(false);
  
  // 🚀 AJUSTE CLAVE: Aplicamos la corrección de zona horaria también a la lista de filtro
  const reservasDelDiaSeleccionado = useMemo(() => {
    const diaSeleccionadoString = fechaSeleccionada.toDateString();
    
    return reservas.filter(
        (reserva) => {
            const [year, month, day] = reserva.fecha.split('-').map(Number);
            const fechaReservaLocal = new Date(year, month - 1, day); 
            
            // Compara la cadena de la fecha local con el día seleccionado
            return fechaReservaLocal.toDateString() === diaSeleccionadoString;
        }
    );
  }, [reservas, fechaSeleccionada]);
  
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
                disabled={cargandoPrestadores || prestadores.length === 0} 
            >
                {cargandoPrestadores ? '⌛ Cargando Datos...' : '➕ Nueva Reserva'}
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
          {/* Indicador de Semana */}
          {vista === 'semanal' && (
            <span className="ml-3 text-base text-gray-500">
              (Semana {indiceSemana + 1} de {totalSemanas})
            </span>
          )}
        </h3>

        <button
          onClick={irMesSiguiente}
          className="p-2 text-gray-700 transition-colors rounded-full hover:bg-gray-200"
          aria-label="Mes siguiente"
        >
          &gt;
        </button>
      </div>

      {/* Controles de Semana */}
      {vista === 'semanal' && (
          <div className="flex justify-center mb-4 space-x-4">
              <button
                  onClick={irSemanaAnterior}
                  disabled={indiceSemana === 0}
                  className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                      indiceSemana === 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
              >
                  ← Semana Anterior
              </button>
              <button
                  onClick={irSemanaSiguiente}
                  disabled={indiceSemana + 1 >= totalSemanas}
                  className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                      indiceSemana + 1 >= totalSemanas
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
              >
                  Semana Siguiente →
              </button>
          </div>
      )}


      {/* Calendario Grid */}
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

        {diasVisibles.map((dia:Date | null,index:number) => {
          
          if (!dia) {
            return (
              <div key={`empty-${index}`} className="h-12 p-2"></div>
            );
          }
          
          const esSeleccionado =
            fechaSeleccionada.toDateString() === dia.toDateString();
          const hayReserva = tieneReserva(dia); 
          const diaEsHoy = esHoy(dia);
          const esDomingo = dia.getDay() === 0;

          return (
            <div
              key={dia.toISOString()}
              onClick={() => manejarClickDia(dia)}
              className={`flex flex-col items-center justify-center cursor-pointer transition-all p-2 h-12 relative rounded-lg 
                      border-2 ${
                        diaEsHoy 
                          ? "border-indigo-300 bg-indigo-50" 
                          : esDomingo 
                            ? "bg-red-50 opacity-80 border-red-200 cursor-not-allowed"
                            : "bg-gray-100 hover:bg-gray-200 border-gray-200"
                      } text-gray-800`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 font-semibold text-lg transition-all 
                ${
                  esSeleccionado
                    ? "bg-blue-600 text-white rounded-full shadow-md"
                    : hayReserva
                    ? "text-green-600" 
                    : diaEsHoy
                    ? "text-indigo-600"
                    : esDomingo
                    ? "text-red-500"
                  : "text-gray-800"
                }
                ${
                  esSeleccionado ? "rounded-full shadow-md" : "" 
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
              prestadores={prestadores} 
              onGuardar={manejarReservaGuardada} 
              onCancelar={manejarCancelar}
              currentCompanyId={idCompany} 

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
                  className="p-3 border rounded-lg bg-gray-50"
                >
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600">⏰ {r.hora}</span>
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{r.servicio}</span>
                    </div>
                    <p className="mt-1 text-gray-800">Cliente: <strong>{r.cliente}</strong></p>
                    <p className="text-sm text-gray-600">Prestador: {r.prestador}</p>
                    <p className="text-xs italic text-gray-500">Motivo: {r.motivo}</p>
                </li>
              ))}
            </ul>

            {/* Botón "Ver más/menos" */}
            {hayMasReservas && (
              <button
                onClick={toggleMostrarReservas}
                className="w-full py-2 mt-3 text-sm font-medium text-blue-600 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
              >
                {mostrarTodasLasReservas ? "Ver menos (Mostrar solo 3)" : `Ver más (${reservasDelDiaSeleccionado.length - LIMITE_RESERVAS_VISIBLES} adicionales)`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}