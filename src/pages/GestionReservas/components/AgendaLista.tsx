// AgendaLista.tsx
// este módulo se encarga de renderizar la lista de reservas para el dia selecionado
import React from 'react';
import { Reserva } from '../types';
import { ReservaGestor } from './ReservaGestor'; // <-- Importación correcta

interface AgendaListaProps {
    fechaSeleccionada: Date;
    reservasVisibles: Reserva[];
    reservasDelDiaSeleccionado: Reserva[];
    hayMasReservas: boolean;
    mostrarTodasLasReservas: boolean;
    toggleMostrarReservas: () => void;
    LIMITE_RESERVAS_VISIBLES: number;
    // NUEVAS PROPS DE GESTIÓN
    manejarModificacion: (reserva: Reserva) => void; 
    manejarCancelacion: (reserva: Reserva) => void; 
}

export const AgendaLista = ({
    fechaSeleccionada,
    reservasVisibles,
    reservasDelDiaSeleccionado,
    hayMasReservas,
    mostrarTodasLasReservas,
    toggleMostrarReservas,
    LIMITE_RESERVAS_VISIBLES,
    manejarModificacion, // <-- Desestructuración
    manejarCancelacion, // <-- Desestructuración
}: AgendaListaProps) => { 
    return (
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
                        {/* Se usa SOLAMENTE ReservaGestor, ya que este incluye el <li> y el contenido */}
                        {reservasVisibles.map((r, i) => ( 
                            <ReservaGestor 
                                key={r.hora + i} // Se recomienda usar un ID único de la reserva si existe (e.g., r.id)
                                reserva={r}
                                onModificar={manejarModificacion}
                                onCancelar={manejarCancelacion}
                            />
                        ))}
                    </ul>

                    {hayMasReservas && (
                        <button
                            onClick={toggleMostrarReservas}
                            className="w-full py-2 mt-3 text-sm font-medium text-blue-400 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
                        >
                            {mostrarTodasLasReservas ? "Ver menos (Mostrar solo 3)" : `Ver más (${reservasDelDiaSeleccionado.length - LIMITE_RESERVAS_VISIBLES} adicionales)`}
                        </button>
                    )}
                </>
            )}
        </div>
    );
};