import React from 'react';
import { Reserva, ReservaGestorProps } from '../types'; 

export const ReservaGestor = ({ reserva, onModificar, onCancelar }: ReservaGestorProps) => {
    
    // Extraer los campos críticos usando 'any' para asegurar compatibilidad si no están tipados
    const idAgenda = (reserva as any).id || (reserva as any).idAgenda || 'N/A';
    const documentoCliente = (reserva as any).documentoCliente || (reserva as any).documento || 'N/A';
    const emailCliente = (reserva as any).emailCliente || (reserva as any).email || 'N/A';
    
    return (
        <li className="flex items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex-1 min-w-0">
                <p className="flex items-center mb-1 text-lg font-bold text-gray-800">
                    <span className="mr-2 text-gray-500">🕒</span> {reserva.hora} 
                    <span className="ml-3 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        {reserva.servicio}
                    </span>
                </p>
                <div className="text-sm text-gray-600 space-y-0.5">
                    <p>
                        <span className="font-semibold">Cliente:</span> {reserva.cliente}
                        {/* 👁️ MOSTRAR INFORMACIÓN CRÍTICA PARA DEPURACIÓN Y VALIDACIÓN */}
                        <span className="ml-2 text-xs text-blue-500">
                           (ID: {idAgenda} | CC: {documentoCliente} | Email: {emailCliente})
                        </span>
                    </p>
                    <p><span className="font-semibold">Prestador:</span> {reserva.prestador}</p>
                    <p><span className="font-semibold">Motivo:</span> {reserva.motivo}</p>
                </div>
            </div>
            
            <div className="flex flex-shrink-0 ml-4 space-x-2">
                <button 
                    onClick={() => onModificar(reserva)} 
                    className="btn btn-sm btn-warning" // Reemplazar con tus clases
                >
                    Modificar
                </button>
                <button 
                    onClick={() => onCancelar(reserva)} 
                    className="btn btn-sm btn-danger" // Reemplazar con tus clases
                >
                    Cancelar
                </button>
            </div>
        </li>
    );
};