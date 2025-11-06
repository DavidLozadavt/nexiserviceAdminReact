import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { Escenario } from '../typesEscenario'; // Importación única y correcta

// Aunque no se use Search, la mantenemos si no afecta, pero la quitaremos para limpiar.
import { ArrowLeft, ArrowRight } from 'lucide-react'; 

interface SelectorEscenariosProps {
    escenarios: Escenario[];
    escenarioSeleccionado: Escenario | null;
    onSelectEscenario: (escenario: Escenario) => void;
}

const BUFFER_SIZE = 3; 
// Usamos el ancho de la tarjeta que el código indica (w-56 = 224px, más space-x-4 = 16px)
// PERO mantendremos el 288+16 ya que el código original lo usaba y el usuario pidió no cambiarlo.
const CARD_FULL_WIDTH = 288 + 16; 

export const SelectorEscenarios: React.FC<SelectorEscenariosProps> = ({
    escenarios,
    escenarioSeleccionado,
    onSelectEscenario
}) => {
    // 🚨 ELIMINAMOS el estado 'filtroTexto' y solo dejamos 'filtroTipo'
    const [filtroTipo, setFiltroTipo] = useState('Todos'); 

    const carruselRef = useRef<HTMLDivElement>(null);

    // 1. OBTENER LOS TIPOS ÚNICOS DISPONIBLES
    const tiposDisponibles = useMemo(() => {
        const tipos = new Set(escenarios.map(e => e.tipo));
        return ['Todos', ...Array.from(tipos)];
    }, [escenarios]);


    // 2. LÓGICA DE FILTRADO (SOLO POR TIPO)
    const escenariosFiltrados = useMemo(() => {
        let lista = escenarios;
        
        // 2a. Filtro por TIPO
        if (filtroTipo !== 'Todos') {
            lista = lista.filter(e => e.tipo === filtroTipo);
        }

        // 🚨 ELIMINAMOS la lógica del filtro de texto para cumplir con la solicitud.
        
        return lista;
    }, [escenarios, filtroTipo]); // Solo dependemos de escenarios y filtroTipo


    // Crear la lista para el carrusel infinito (basada en escenariosFiltrados)
    const infiniteEscenarios = useMemo(() => {
        if (escenariosFiltrados.length <= BUFFER_SIZE) {
            return escenariosFiltrados;
        }
        const appended = escenariosFiltrados.slice(0, BUFFER_SIZE);
        const prepended = escenariosFiltrados.slice(-BUFFER_SIZE);
        return [...prepended, ...escenariosFiltrados, ...appended];
    }, [escenariosFiltrados]);

    
    
    const handleScroll = useCallback(() => {
        if (!carruselRef.current || escenariosFiltrados.length <= BUFFER_SIZE) return;

        const { scrollLeft } = carruselRef.current;
        const normalItemsLength = escenariosFiltrados.length;
        
        const startOfRealContent = BUFFER_SIZE * CARD_FULL_WIDTH;
        const endOfRealContent = (BUFFER_SIZE + normalItemsLength) * CARD_FULL_WIDTH;

        if (scrollLeft >= endOfRealContent - CARD_FULL_WIDTH) { 
            carruselRef.current.scrollLeft = startOfRealContent;
        } 
        else if (scrollLeft <= 0) {
            // Ajustamos el salto al final para que sea correcto según el cálculo del carrusel infinito
            carruselRef.current.scrollLeft = endOfRealContent - carruselRef.current.clientWidth;
        }

    }, [escenariosFiltrados.length]);

    // Función de desplazamiento para las flechas (scroll)
    const scroll = useCallback((direction: 'left' | 'right') => {
        if (!carruselRef.current) return;
        const scrollAmount = direction === 'left' ? -CARD_FULL_WIDTH : CARD_FULL_WIDTH;
        carruselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }, []);

    // Posicionamiento Inicial y Reinicio al Filtrar
    useEffect(() => {
        if (carruselRef.current && escenariosFiltrados.length > BUFFER_SIZE) {
            carruselRef.current.scrollLeft = BUFFER_SIZE * CARD_FULL_WIDTH;
        }
    }, [escenariosFiltrados.length]);


    return (
        <div className="mb-6">
            {/* 🚨 CORRECCIÓN DE ESTILO: Estilo de título consistente con dark mode */}
            <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
                Escenarios disponibles
            </h2>
            
            <div className="flex flex-col gap-4 mb-6 md:flex-row">
                
                {/* Filtro por TIPO (ÚNICO FILTRO) */}
                <div className="flex-shrink-0 w-full md:w-1/3">
                    <label htmlFor="filterType" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Filtrar por Tipo
                    </label>
                    <select
                        id="filterType"
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        // 🚨 CORRECCIÓN DE ESTILO: Consistencia de border y fondo
                        className="w-full py-3 pl-3 pr-10 border border-gray-300 shadow-inner rounded-xl focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    >
                        {tiposDisponibles.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                    </select>
                </div>

                {/* 🚨 ELIMINAMOS el div del filtro de texto para dejar solo el de tipo */}
            </div>

            {escenariosFiltrados.length === 0 ? (
                <p className="p-4 text-center text-gray-500 border border-dashed rounded-lg dark:text-gray-400">
                    No hay escenarios que coincidan con los filtros seleccionados.
                </p>
            ) : (
                <div className="relative flex items-center">
                    
                    {/* Botón de Desplazamiento Izquierda */}
                    {escenariosFiltrados.length > BUFFER_SIZE && (
                        <button
                            onClick={() => scroll('left')}
                            // 🚨 CORRECCIÓN DE ESTILO: Posicionamiento y color consistente con dark mode
                            className="absolute z-20 p-2 transition transform -translate-y-1/2 bg-blue-300 rounded-full shadow-lg cursor-pointer -left-7 top-1/2 dark: bg-white/90 hover:bg-gray-200 dark:bg-gray-700/90 dark:hover:bg-gray-600 dark:text-gray-100"
                            aria-label="Desplazar izquierda"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}

                    {/* CARRUSEL */}
                    <div
                        ref={carruselRef}
                        className="flex px-16 py-3 space-x-4 overflow-x-auto scrollbar-hide" 
                        onScroll={handleScroll} 
                    >
                        {infiniteEscenarios.map((escenario, index) => {
                            const key = `${escenario.id}-${index}`;
                            const isSelected = escenarioSeleccionado?.id === escenario.id;

                            return (
                                <div
                                    key={key}
                                    onClick={() => onSelectEscenario(escenario)}
                                    className={`flex-shrink-0 w-56 cursor-pointer border rounded-xl p-4 text-center transition duration-200 ease-in-out
                                        ${isSelected
                                            ? 'border-blue-300 bg-primary-50 shadow-xl ring-4 ring-blue-300 dark:bg-primary-900 dark:border-primary-400 dark:ring-primary-700' 
                                            : 'border-gray-200 bg-white shadow-md hover:shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
                                        }
                                    `}
                                >
                                    <div className="w-full h-32 mb-3 overflow-hidden rounded-lg">
                                        {escenario.imagenUrl ? (
                                            <img
                                                src={escenario.imagenUrl}
                                                alt={escenario.nombre}
                                                className="object-cover w-full h-full" 
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-sm font-medium text-gray-500 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-400">
                                                Sin Imagen
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-1 text-xl font-extrabold text-gray-900 truncate dark:text-white">{escenario.nombre}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Tipo: {escenario.tipo}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Capacidad: {escenario.capacidad}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Botón de Desplazamiento Derecha */}
                    {escenariosFiltrados.length > BUFFER_SIZE && (
                        <button
                            onClick={() => scroll('right')}
                            // 🚨 CORRECCIÓN DE ESTILO: Posicionamiento y color consistente con dark mode
                            className="absolute z-20 p-2 transition transform -translate-y-1/2 bg-blue-300 rounded-full shadow-lg cursor-pointer -right-7 top-1/2 dark:bg-white/90 hover:bg-gray-200 dark:bg-gray-700/90 dark:hover:bg-gray-600 dark:text-gray-100"
                            aria-label="Desplazar derecha"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SelectorEscenarios;