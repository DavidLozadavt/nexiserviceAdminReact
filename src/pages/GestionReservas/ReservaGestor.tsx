// ReservaGestor.tsx
import React from 'react';
import { Reserva } from './types';

interface ReservaGestorProps {
    reserva: Reserva;
    // Handlers definidos en CalendarioReservas.tsx
    onModificar: (reserva: Reserva) => void;
    onCancelar: (reserva: Reserva) => void; 
}

export const ReservaGestor = ({ reserva, onModificar, onCancelar }: ReservaGestorProps) => {

    const handleCancelarClick = () => {
        // Confirmación simple antes de llamar al handler principal
        if (window.confirm(`⚠️ ¿Confirma la cancelación de la reserva de ${reserva.cliente} (${reserva.hora})? Esta acción no se puede deshacer.`)) {
            onCancelar(reserva);
        }
    };
    
    return (
        <li className="flex flex-col p-3 space-y-2 border rounded-lg bg-gray-50">
            
            {/* Contenido de la Reserva (igual que antes) */}
            <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400">⏰ {reserva.hora}</span>
                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{reserva.servicio}</span>
            </div>
            <p className="mt-1 text-gray-800">Cliente: <strong>{reserva.cliente}</strong></p>
            <p className="text-sm text-gray-600">Prestador: {reserva.prestador}</p>
            <p className="text-xs italic text-gray-500">Motivo: {reserva.motivo}</p>
            
            {/* Botones de Gestión */}
            <div className="flex justify-end pt-2 mt-2 space-x-2 border-t">
                <button
                    onClick={() => onModificar(reserva)}
                    className="px-3 py-1 text-xs text-yellow-800 transition bg-yellow-100 rounded hover:bg-yellow-200"
                    title="Abrir formulario para editar la reserva"
                >
                    Modificar
                </button>
                <button
                    onClick={handleCancelarClick}
                    className="px-3 py-1 text-xs text-red-800 transition bg-red-100 rounded hover:bg-red-200"
                    title="Cancelar la reserva definitivamente"
                >
                    Cancelar
                </button>
            </div>
        </li>
    );
};