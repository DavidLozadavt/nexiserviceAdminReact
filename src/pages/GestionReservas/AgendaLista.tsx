//este módulo se encarga de renderizar la lista de reservas para el dia selecionado
import React from 'react';
import { Reserva } from './types';

interface AgendaListaProps {
    fechaSeleccionada: Date;
    reservasVisibles: Reserva[];
    reservasDelDiaSeleccionado: Reserva[];
    hayMasReservas: boolean;
    mostrarTodasLasReservas: boolean;
    toggleMostrarReservas: () => void;
    LIMITE_RESERVAS_VISIBLES: number;
}

export const AgendaLista = ({
    fechaSeleccionada,
    reservasVisibles,
    reservasDelDiaSeleccionado,
    hayMasReservas,
    mostrarTodasLasReservas,
    toggleMostrarReservas,
    LIMITE_RESERVAS_VISIBLES
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
                        {reservasVisibles.map((r, i) => ( 
                            <li
                                key={i}
                                className="p-3 border rounded-lg bg-gray-50"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-blue-400">⏰ {r.hora}</span>
                                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{r.servicio}</span>
                                </div>
                                <p className="mt-1 text-gray-800">Cliente: <strong>{r.cliente}</strong></p>
                                <p className="text-sm text-gray-600">Prestador: {r.prestador}</p>
                                <p className="text-xs italic text-gray-500">Motivo: {r.motivo}</p>
                            </li>
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