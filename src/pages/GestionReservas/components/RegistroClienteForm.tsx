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

    const colorPrimario = 'purple';
    const colorClaro = '500';
    const colorOscuro = '600';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

            {/* Contenedor del formulario flotante */}
            <div className="w-full max-w-xl p-8 transition-colors duration-300 bg-white rounded-lg shadow-2xl dark:bg-gray-800 dark:text-gray-200">

                <h3 className="mb-6 text-2xl font-bold text-center text-gray-800 dark:text-white">
                    Registro de Nuevo Cliente
                </h3>

                <div className="mb-6 text-center">
                    <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        ⚠️ Cliente no encontrado.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        Complete los datos y asigne una contraseña para registrarlo y continuar:
                    </p>
                </div>

                {/* GRID DE DOS COLUMNAS CON ESPACIO DE 4 */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* Primer Nombre */}
                    <input type="text" placeholder="Primer Nombre" name="nombre1" required
                        value={clienteNuevo.nombre1}
                        onChange={handleNuevoClienteChange}
                        className={`w-full p-3 placeholder-gray-500 transition-colors duration-200 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-${colorPrimario}-${colorClaro} focus:border-${colorPrimario}-${colorClaro} dark:placeholder-gray-400`}
                    />

                    {/* Primer Apellido */}
                    <input type="text" placeholder="Primer Apellido" name="apellido1" required
                        value={clienteNuevo.apellido1}
                        onChange={handleNuevoClienteChange}
                        className={`w-full p-3 placeholder-gray-500 transition-colors duration-200 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-${colorPrimario}-${colorClaro} focus:border-${colorPrimario}-${colorClaro} dark:placeholder-gray-400`}
                    />

                    {/* Documento (Identificación) */}
                    <input type="text" placeholder="Documento / ID" name="documento" required
                        value={clienteNuevo.documento}
                        onChange={handleNuevoClienteChange}
                        className={`w-full p-3 placeholder-gray-500 transition-colors duration-200 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-${colorPrimario}-${colorClaro} focus:border-${colorPrimario}-${colorClaro} dark:placeholder-gray-400`}
                    />

                    {/* Teléfono/Celular */}
                    <input type="text" placeholder="Teléfono/Celular" name="celular"
                        value={clienteNuevo.celular}
                        onChange={handleNuevoClienteChange}
                        className={`w-full p-3 placeholder-gray-500 transition-colors duration-200 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-${colorPrimario}-${colorClaro} focus:border-${colorPrimario}-${colorClaro} dark:placeholder-gray-400`}
                    />

                    {/* Email (ocupa 2 columnas) */}
                    <input type="email" placeholder="Email" name="email"
                        value={clienteNuevo.email}
                        onChange={handleNuevoClienteChange}
                        className={`w-full col-span-1 p-3 placeholder-gray-500 transition-colors duration-200 border border-gray-300 rounded-md md:col-span-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-${colorPrimario}-${colorClaro} focus:border-${colorPrimario}-${colorClaro} dark:placeholder-gray-400`}
                    />

                    <input type="password" placeholder="Contraseña (Mínimo 8 caracteres)" name="password" required
                        value={(clienteNuevo as any).password || ''}
                        onChange={handleNuevoClienteChange}
                        className={`w-full col-span-1 p-3 placeholder-gray-500 transition-colors duration-200 border border-gray-300 rounded-md md:col-span-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-${colorPrimario}-${colorClaro} focus:border-${colorPrimario}-${colorClaro} dark:placeholder-gray-400`}
                    />

                    {/* Dirección (Opcional, abarca 2 columnas) */}
                    <input type="text" placeholder="Dirección (Opcional)" name="direccion"
                        value={clienteNuevo.direccion}
                        onChange={handleNuevoClienteChange}
                        className={`w-full col-span-1 p-3 placeholder-gray-500 transition-colors duration-200 border border-gray-300 rounded-md md:col-span-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:ring-2 focus:ring-${colorPrimario}-${colorClaro} focus:border-${colorPrimario}-${colorClaro} dark:placeholder-gray-400`}
                    />

                </div>

                {/* Botones de Acción del Modal */}
                <div className="flex justify-end pt-8 space-x-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 transition-colors duration-200 border border-gray-300 rounded-md hover:bg-red-600 hover:text-white"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-6 py-2 text-gray-700 transition-colors duration-200 bg-gray-100 border border-gray-300 rounded-md hover:bg-green-600 hover:text-white"
                    >
                        Registrar y Seleccionar
                    </button>
                </div>
            </div>
        </div>
    );
};