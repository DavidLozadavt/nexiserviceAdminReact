import React from 'react';
import { Escenario } from '../typesEscenario'; 

interface SelectorEscenariosProps {
    escenarios: Escenario[];
    escenarioSeleccionado: Escenario | null;
    onSelectEscenario: (escenario: Escenario) => void;
}

export const SelectorEscenarios: React.FC<SelectorEscenariosProps> = ({ 
    escenarios, 
    escenarioSeleccionado, 
    onSelectEscenario 
}) => {
    return (
        <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-700">
                Escenarios disponibles
            </h2>

            {escenarios.length === 0 ? (
                <p className="text-sm text-gray-500">No hay escenarios disponibles.</p>
            ) : (
                // 💡 CAMBIO CLAVE: Contenedor con carrusel horizontal
                <div 
                    className="flex pb-4 space-x-4 overflow-x-auto scrollbar-hide" 
                    // 'space-x-4' añade espacio entre las tarjetas
                    // 'pb-4' asegura espacio para la barra de desplazamiento si aparece
                    // 'overflow-x-auto' permite el desplazamiento horizontal
                >
                    {escenarios.map((escenario) => {
                        // Determinar si es el escenario seleccionado para aplicar estilos
                        const isSelected = escenarioSeleccionado?.id === escenario.id;

                        return (
                            <div
                                key={escenario.id}
                                onClick={() => onSelectEscenario(escenario)}
                                // 💡 Estilos de la tarjeta: ancho fijo para el carrusel
                                className={`flex-shrink-0 w-60 cursor-pointer border rounded-xl p-3 text-center shadow-md hover:shadow-lg transition duration-200
                                    ${isSelected
                                        ? 'border-primary-500 bg-primary-100 ring-2 ring-primary-500' // Estilos de selección mejorados
                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                    }
                                `}
                            >
                                {escenario.imagenUrl ? (
                                    <img
                                        src={escenario.imagenUrl}
                                        alt={escenario.nombre}
                                        className="object-cover w-full h-24 mb-2 rounded-lg"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-24 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg">
                                        Sin Imagen
                                    </div>
                                )}
                                <p className="mt-1 font-semibold text-gray-900 truncate">{escenario.nombre}</p>
                                <p className="text-sm text-gray-600">Capacidad: {escenario.capacidad}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SelectorEscenarios;