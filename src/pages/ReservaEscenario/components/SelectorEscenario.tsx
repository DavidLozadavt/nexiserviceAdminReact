// src/pages/ReservaEscenario/components/SelectorEscenarios.tsx
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
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {escenarios.map((escenario) => (
                        <div
                            key={escenario.id}
                            onClick={() => onSelectEscenario(escenario)}
                            className={`cursor-pointer border rounded-xl p-3 text-center shadow-sm hover:shadow-md transition
                                ${escenarioSeleccionado === escenario
                                    ? 'border-primary bg-primary-light' 
                                    : 'border-gray-200'
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
                                <div className="flex items-center justify-center w-full h-24 text-sm text-gray-400 bg-gray-100 rounded-lg">
                                    Sin imagen
                                </div>
                            )}
                            <p className="font-semibold text-gray-800">{escenario.nombre}</p>
                            <p className="text-sm text-gray-500">Capacidad: {escenario.capacidad}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectorEscenarios;