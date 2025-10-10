import React from 'react';
import { ClienteNuevo } from './types'; 

export const RegistroClienteForm = ({ 
    clienteNuevo, 
    handleNuevoClienteChange,
    onClose,
    onConfirm
}: {
    clienteNuevo: ClienteNuevo;
    handleNuevoClienteChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onClose: () => void;
    onConfirm: () => void; 
}) => {

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            
            {/* Contenedor del formulario flotante */}
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-2xl">
                <h3 className="mb-4 text-xl font-semibold text-orange-800">
                    Registro de Nuevo Cliente
                </h3>

                <div className="space-y-3">
                    <p className="font-semibold text-orange-800">
                        ⚠️ Cliente no encontrado. Complete los datos para registrarlo y continuar:
                    </p>
                    
                    {/* Campos del formulario */}
                    <input type="text" placeholder="Primer Nombre" name="nombre1" required
                        value={clienteNuevo.nombre1}
                        onChange={handleNuevoClienteChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input type="text" placeholder="Primer Apellido" name="apellido1" required
                        value={clienteNuevo.apellido1}
                        onChange={handleNuevoClienteChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input type="text" placeholder="Documento" name="documento" required
                        value={clienteNuevo.documento}
                        onChange={handleNuevoClienteChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input type="text" placeholder="Teléfono/Celular" name="celular"
                        value={clienteNuevo.celular}
                        onChange={handleNuevoClienteChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    <input type="email" placeholder="Email" name="email"
                        value={clienteNuevo.email}
                        onChange={handleNuevoClienteChange} 
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                </div>
                
                {/* Botones de Acción del Modal */}
                <div className="flex justify-end pt-4 space-x-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                        Registrar y Seleccionar
                    </button>
                </div>
            </div>
        </div>
    );
};