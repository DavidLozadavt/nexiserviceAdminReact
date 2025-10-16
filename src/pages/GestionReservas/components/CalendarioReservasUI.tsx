// CalendarioReservasUI.tsx
// módulo para diseño visual del calendario, renderiza los días, abre modal de ReservaForm y AgendaLista

import React from "react";
// 1. Importar los tipos necesarios, incluyendo FiltroEstado
import { Prestador, CalendarioReservasProps, Reserva } from "../types"; 
import { ReservaForm } from "./ReservaForm";
import { AgendaLista } from "./AgendaLista";
import { useCalendarLogic, FiltroEstado } from "../hooks/useCalendarLogic"; // 🔑 Importar FiltroEstado

interface CalendarLogicProps extends Omit<ReturnType<typeof useCalendarLogic>, 
  'setFechaSeleccionada' | 'setVista' | 'setMesActual' | 'setIndiceSemana' | 'setMostrarTodasLasReservas'
> {}

interface CalendarioReservasUIProps extends CalendarioReservasProps, CalendarLogicProps {
    prestadores: Prestador[];
    cargandoPrestadores: boolean;
    manejarNuevaReserva: () => void;
    manejarReservaGuardada: () => void;
    manejarCancelar: () => void;
    mostrarFormulario: boolean;
    setMostrarFormulario: React.Dispatch<React.SetStateAction<boolean>>;
    
    // 2. AÑADIR NUEVAS PROPS DE GESTIÓN
    reservaParaModificar: Reserva | null;
    manejarModificacion: (reserva: Reserva) => void;
    manejarCancelacion: (reserva: Reserva) => void;
    
    // 🔑 PROPS DEL FILTRO
    filtroEstado: FiltroEstado;
    setFiltroEstado: React.Dispatch<React.SetStateAction<FiltroEstado>>;
}

export const CalendarioReservasUI = (
    {   
        idCompany, 
        prestadores,
        cargandoPrestadores,
        manejarNuevaReserva,
        manejarReservaGuardada,
        manejarCancelar,
        mostrarFormulario,
        
        // Props de Gestión
        reservaParaModificar, 
        manejarModificacion,
        manejarCancelacion,
        
        // 🔑 PROPS DEL FILTRO (Añadidas a la desestructuración)
        filtroEstado, 
        setFiltroEstado,
        
        // Props de useCalendarLogic
        fechaSeleccionada,
        vista,
        indiceSemana,
        totalSemanas,
        nombreDelMes,
        diasVisibles,
        reservasVisibles,
        reservasDelDiaSeleccionado,
        hayMasReservas,
        mostrarTodasLasReservas,
        LIMITE_RESERVAS_VISIBLES,
        irMesAnterior,
        irMesSiguiente,
        irSemanaAnterior,
        irSemanaSiguiente,
        manejarCambioVista,
        manejarClickDia,
        toggleMostrarReservas,
        tieneReserva,
        esDiaInactivo,
        esHoy,
    }: CalendarioReservasUIProps 
) => {
    
    // 🔑 Función para obtener las clases condicionales del selector de filtro
    const getFiltroClasses = (estado: FiltroEstado): string => {
        switch (estado) {
            case 'ACTIVO':
                return 'bg-green-100 border-green-400 text-green-700';
            case 'CANCELADO':
                return 'bg-red-100 border-red-400 text-red-700';
            case 'TODOS':
            default:
                return 'bg-gray-200 border-gray-400 text-gray-700';
        }
    };

    const filtroClases = getFiltroClasses(filtroEstado);
    
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
                        className="px-4 py-2 text-white transition-all bg-blue-400 rounded-lg hover:bg-blue-400"
                        disabled={cargandoPrestadores || prestadores.length === 0} 
                    >
                        {cargandoPrestadores ? '⌛ Cargando Datos...' : '➕ Nueva Reserva'}
                    </button>
                </div>
                
                {/* Selector de Vista (se mantiene aquí) */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="vista-selector" className="text-gray-600">Vista:</label>
                    <select
                        id="vista-selector"
                        value={vista}
                        onChange={manejarCambioVista}
                        className="px-3 py-2 bg-white border rounded-lg focus:ring-blue-400 focus:border-blue-400"
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
                            : 'bg-indigo-100 text-blue-400 hover:bg-indigo-200'
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
                            : 'bg-indigo-100 text-blue-400 hover:bg-indigo-200'
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
                    
                    const esSeleccionado = fechaSeleccionada.toDateString() === dia.toDateString();
                    const hayReserva = tieneReserva(dia); 
                    const diaEsHoy = esHoy(dia);
                    const esBloqueado = esDiaInactivo(dia); 
                    
                    return (
                        <div
                            key={dia.toISOString()}
                            onClick={() => !esBloqueado && manejarClickDia(dia)} 
                            className={`flex flex-col items-center justify-center transition-all p-2 h-12 relative rounded-lg 
                                    border-2 ${
                                        esBloqueado 
                                        ? "bg-gray-300 opacity-60 cursor-not-allowed border-gray-400" 
                                        : "cursor-pointer"
                                    } text-gray-800
                                    ${
                                        diaEsHoy 
                                          ? "border-blue-400 bg-indigo-50" 
                                          : hayReserva && !esBloqueado
                                            ? "bg-green-100 border-green-200" 
                                            : esBloqueado
                                            ? "bg-gray-300 border-gray-400" 
                                            : "bg-gray-100 hover:bg-gray-200 border-gray-200"
                                    }
                                    `}
                        >
                            <div
                                className={`flex items-center justify-center w-10 h-10 font-semibold text-lg transition-all 
                                ${
                                    esSeleccionado
                                        ? "bg-blue-400 text-white rounded-full shadow-md"
                                        : hayReserva && !esBloqueado
                                        ? "text-green-600" 
                                        : diaEsHoy
                                        ? "text-blue-400"
                                        : esBloqueado
                                        ? "text-gray-500"
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
                            // 3. PASAR LA RESERVA A EDITAR (null si es nueva)
                            reservaAEditar={reservaParaModificar} 
                        />
                    </div>
                </div>
            )}
            
            {/* 🔑 CONTENEDOR DE TÍTULO Y FILTRO DE LA LISTA */}
            <div className="flex items-center justify-between mt-8 mb-3"> 
                <h3 className="text-lg font-semibold">
                    Reservas para el {fechaSeleccionada.toLocaleDateString()}
                </h3>

                {/* 🔑 Selector de Filtro de Estado */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="filtro-selector" className="text-gray-600 sr-only">Estado:</label>
                    <select
                        id="filtro-selector"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
                        // 🔑 APLICAR CLASES CONDICIONALES PARA EL RESALTADO
                        className={`
                            px-3 py-1 border rounded-lg text-sm font-medium transition-colors cursor-pointer appearance-none
                            ${filtroClases}
                        `}
                    >
                        <option value="ACTIVO">Activas</option>
                        <option value="CANCELADO">Canceladas</option>
                        <option value="TODOS">Todas</option>
                    </select>
                </div>
            </div>


            {/* Lista de reservas (Componente Aislado) */}
            <AgendaLista
                fechaSeleccionada={fechaSeleccionada}
                reservasVisibles={reservasVisibles}
                reservasDelDiaSeleccionado={reservasDelDiaSeleccionado}
                hayMasReservas={hayMasReservas}
                mostrarTodasLasReservas={mostrarTodasLasReservas}
                toggleMostrarReservas={toggleMostrarReservas}
                LIMITE_RESERVAS_VISIBLES={LIMITE_RESERVAS_VISIBLES}
                
                // 4. PASAR HANDLERS DE GESTIÓN
                manejarModificacion={manejarModificacion}
                manejarCancelacion={manejarCancelacion}
            />
        </div>
    );
};