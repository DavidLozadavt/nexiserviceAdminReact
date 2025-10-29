// este módulo se encarga de renderizar la lista de reservas para el dia seleccionado
import React from 'react';
import { Reserva } from '../types';
import { ReservaGestor } from './ReservaGestor'; 

interface AgendaListaProps {
    fechaSeleccionada: Date;
    reservasVisibles: Reserva[]; // 
    reservasDelDiaSeleccionado: Reserva[]; // 
    hayMasReservas: boolean;
    mostrarTodasLasReservas: boolean;
    toggleMostrarReservas: () => void;
    LIMITE_RESERVAS_VISIBLES: number;
    manejarModificacion: (reserva: Reserva) => void; 
    manejarCancelacion: (reserva: Reserva) => void; 
    manejarFinalizacion: (reserva: Reserva) => void; 
}

export const AgendaLista = ({
    fechaSeleccionada,
    reservasVisibles,
    reservasDelDiaSeleccionado,
    hayMasReservas,
    mostrarTodasLasReservas,
    toggleMostrarReservas,
    LIMITE_RESERVAS_VISIBLES,
    manejarModificacion,
    manejarCancelacion,
    manejarFinalizacion, 
}: AgendaListaProps) => { 
    
    const totalReservasFiltradasDelDia = reservasDelDiaSeleccionado.length;
    
    const noHayReservasVisibles = totalReservasFiltradasDelDia === 0;
    
    return (
        <div className="mb-8"> 
            
            {noHayReservasVisibles ? (
                <p className="p-3 text-gray-600 border border-yellow-200 rounded-lg bg-yellow-50 ">
                    No hay reservas para mostrar con el filtro y la fecha seleccionada.
                </p>
            ) : (
                <>
                    <ul className="space-y-2">
                        {reservasVisibles.map((r, i) => ( 
                            <ReservaGestor 
                                key={r.idAgenda ? r.idAgenda : `reserva-${i}`} 
                                reserva={r}
                                onModificar={manejarModificacion}
                                onCancelar={manejarCancelacion}
                                onFinalizar={manejarFinalizacion} 
                            />
                        ))}
                    </ul>

                    {hayMasReservas && (
                        <button
                            onClick={toggleMostrarReservas}
                            className="w-full py-2 mt-3 text-sm font-medium text-blue-400 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
                        >
                            {mostrarTodasLasReservas 
                                ? "Ver menos (Mostrar solo 3)" 
                                : `Ver más (${totalReservasFiltradasDelDia - LIMITE_RESERVAS_VISIBLES} adicionales)`
                            }
                        </button>
                    )}
                </>
            )}
        </div>
    );
};