// ReservaGestor.tsx (Versión Final sin tachado en los detalles)
import React from 'react';
import { Reserva, ReservaGestorProps } from '../types'; 

export const ReservaGestor = ({ reserva, onModificar, onCancelar }: ReservaGestorProps) => {
    
    const estado = reserva.estado?.toUpperCase();
    const esCancelada = estado === 'CANCELADO' || estado === 'ANULADO';
    
    // Solo aplica estilo visual al contenedor principal
    const contenedorClase = esCancelada 
        ? 'bg-gray-100 text-gray-700 opacity-90 border-l-4 border-gray-400' // Ajusté la opacidad y el texto color a un gris más oscuro
        : 'bg-white border-l-4 border-blue-400';

    const idAgenda = (reserva as any).id || (reserva as any).idAgenda || 'N/A';
    const documentoCliente = (reserva as any).documentoCliente || (reserva as any).documento || 'N/A';
    const emailCliente = (reserva as any).emailCliente || (reserva as any).email || 'N/A';
    
    return (
        <li className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm transition-all ${contenedorClase}`}>
            
            <div className="flex-1 min-w-0">
                {/* Título de la Reserva (Se mantiene el estilo para el título de la hora) */}
                <p className={`flex items-center mb-1 text-lg font-bold ${esCancelada ? 'text-gray-600' : 'text-gray-800'}`}>
                    <span className="mr-2 text-gray-500">🕒</span> {reserva.hora} 
                    
                    {/* Etiqueta de Estado */}
                    {esCancelada ? (
                        <span className="ml-3 text-sm font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            CANCELADA
                        </span>
                    ) : (
                        <span className="ml-3 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                             {reserva.servicio}
                         </span>
                    )}
                </p>
                
                {/* DETALLES: NO APLICAR CLASE DE TACHADO AQUÍ */}
                <div className="text-sm text-gray-600 space-y-0.5">
                    
                    <p>
                        <span className="font-semibold">Cliente:</span> {reserva.cliente}
                        <span className="ml-2 text-xs text-blue-500">
                           (ID: {idAgenda} | CC: {documentoCliente} | Email: {emailCliente})
                        </span>
                    </p>
                    <p>
                        <span className="font-semibold">Prestador:</span> {reserva.prestador}
                    </p>
                    <p>
                        <span className="font-semibold">Motivo:</span> {reserva.motivo}
                    </p>
                </div>
            </div>
            
            {/* Botones Condicionales */}
            <div className="flex flex-shrink-0 ml-4 space-x-2">
                {!esCancelada ? (
                    <>
                        <button 
                            onClick={() => onModificar(reserva)} 
                            className="px-3 py-1 text-sm font-semibold text-white transition-colors bg-yellow-500 rounded-lg hover:bg-yellow-600"
                        >
                            Modificar
                        </button>
                        <button 
                            onClick={() => onCancelar(reserva)} 
                            className="px-3 py-1 text-sm font-semibold text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
                        >
                            Cancelar
                        </button>
                    </>
                ) : (
                    // Mensaje cuando la reserva está cancelada
                    <span className="px-3 py-1 text-xs font-semibold text-red-600">
                        Cancelada
                    </span>
                )}
            </div>
        </li>
    );
};