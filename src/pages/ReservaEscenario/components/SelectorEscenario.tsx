
import React, { useState, useMemo, useRef } from 'react';
import { Escenario } from '../typesEscenario';

interface SelectorEscenariosProps {
    escenarios: Escenario[];
    escenarioSeleccionado: Escenario | null;
    onSelectEscenario: (escenario: Escenario) => void;
}


const SCROLL_AMOUNT = 320;

export const SelectorEscenarios = ({
  escenarios,
  escenarioSeleccionado,
  onSelectEscenario,
}: {
  escenarios: Escenario[];
  escenarioSeleccionado?: Escenario | null;
  onSelectEscenario: (escenario: Escenario) => void;
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Estado para el filtro
    const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');

    const tiposUnicos = useMemo(() => {
        const types = escenarios.map(e => e.tipo).filter(t => t && t !== 'null' && t !== 'undefined');
        return ['TODOS', ...Array.from(new Set(types))];
    }, [escenarios]);

    // 2. Lógica de Filtrado
    const escenariosFiltrados = useMemo(() => {
        if (filtroTipo === 'TODOS') {
            return escenarios;
        }
        return escenarios.filter(e => e.tipo === filtroTipo);
    }, [escenarios, filtroTipo]);

    // 3. Funciones de Navegación 
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const currentScroll = scrollContainerRef.current.scrollLeft;
            let newScroll = currentScroll;
            if (direction === 'left') {
                newScroll = Math.max(0, currentScroll - SCROLL_AMOUNT);
            } else {
                newScroll = currentScroll + SCROLL_AMOUNT;
            }
            scrollContainerRef.current.scrollTo({
                left: newScroll,
                behavior: 'smooth'
            });
        }
    };
    return (
        <div className="p-4 mb-6 transition-colors bg-white shadow-lg dark:bg-coal-600 rounded-xl">
            {/* TÍTULO Y FILTRO */}
            <div className="flex flex-col mb-4 md:flex-row md:justify-between md:items-center">
                <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-800 md:mb-0">
                    Selector de Escenarios
                </h2>
                {/* FILTRO POR TIPO */}
                <div className="w-full md:w-auto">
                    <select
                        id="filtro-tipo"
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 rounded-md focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-coal-500 dark:border-coal-400 dark:text-gray-800"
                    >
                        {tiposUnicos.map(tipo => (
                            <option key={tipo} value={tipo} className="dark:bg-coal-700">
                                {tipo}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {/*  CONTENEDOR DE ESCENARIOS Y NAVEGACIÓN  */}
            {escenarios.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay escenarios disponibles.</p>
            ) : escenariosFiltrados.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay escenarios para el tipo "{filtroTipo}".</p>
            ) : (
                <div className="relative flex items-center group">
                    {/* Botón IZQUIERDA */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 z-10 p-2 text-white transition-opacity transform -translate-x-1/2 rounded-full opacity-0 bg-black/50 hover:bg-black/70 group-hover:opacity-100 dark:bg-gray-400 dark:hover:bg-coal-900 md:relative md:translate-x-0 md:opacity-100"
                        aria-label="Escenario anterior"
                    >
                        {'<'}
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="flex w-full p-1 space-x-4 overflow-x-auto hide-scrollbar scrollbar-hide"
                    >
                        {escenariosFiltrados.map((escenario) => (
                            <div
                                key={escenario.id}
                                onClick={() => onSelectEscenario(escenario)}
                                className={`flex-shrink-0 w-[300px] md:w-[300px] cursor-pointer border rounded-xl p-3 shadow-md transition-all duration-300
${escenarioSeleccionado?.id === escenario.id
                                        ? 'border-blue-300 dark:border-blue-400 ring-2 ring-blue-400 bg-blue-100 dark:bg-blue-400'
                                        : 'border-gray-200 dark:border-coal-500 bg-white dark:bg-coal-700 hover:shadow-lg' // Normal
                                    }
`}
                            >
                                {/* Contenido del Escenario */}
                                {escenario.imagenUrl ? (
                                    <img
                                        src={escenario.imagenUrl}
                                        alt={escenario.nombre}
                                        className="object-cover w-full h-32 mb-3 rounded-lg"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-32 text-sm text-gray-400 bg-gray-200 rounded-lg dark:bg-coal-600">
                                        Sin imagen
                                    </div>
                                )}
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{escenario.nombre}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Capacidad: {escenario.capacidad}</p>
                            </div>
                        ))}
                    </div>
                    {/* Botón DERECHA */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 z-10 p-2 text-white transition-opacity transform translate-x-1/2 rounded-full opacity-0 bg-black/50 hover:bg-black/70 group-hover:opacity-100 dark:bg-gray-400 dark:hover:bg-coal-900 md:relative md:translate-x-0 md:opacity-100"
                        aria-label="Escenario siguiente"
                    >
                        {'>'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SelectorEscenarios;
