// src/components/ReservaEscenarioForm.tsx
import axios, { AxiosError } from 'axios'; // <-- ¡IMPORTA AxiosError AQUÍ!
import React, { useState, useCallback, useMemo } from 'react';
// Asegúrate de que estos tipos estén correctamente importados desde tu archivo typesEscenario.ts
import { Escenario, ReservaEscenario } from "../typesEscenario"
// Si no usas notistack, puedes reemplazar este hook por un simple console.log o alert
import { useSnackbar } from 'notistack';

// --- 1. DEFINICIÓN DE TIPOS ---

// Tipo para el estado local del formulario
interface ReservaFormData {
    idEscenario: number | null;
    fechaInicio: string; // Formato YYYY-MM-DDTHH:MM
    fechaFin: string;   // Formato YYYY-MM-DDTHH:MM
    detalle: string;
}

interface ReservaEscenarioFormProps {
    fechaSeleccionada: Date;        // El día que se hizo clic en el calendario
    escenarios: Escenario[];        // Lista de escenarios para el selector
    currentCompanyId: number;       // ID de la compañía actual

    reservaAEditar: (ReservaEscenario & { detalle: string }) | null; // Null para nueva reserva (Añadimos detalle para el formulario)

    onGuardar: () => void;          // Función para cerrar el modal y refrescar el calendario
    onCancelar: () => void;         // Función para cerrar el modal
}

// --- 2. FUNCIONES DE UTILIDAD ---

// Formatea un objeto Date a la cadena requerida por <input type="datetime-local">
const formatDateTimeLocal = (date: Date, hours: number = 0, minutes: number = 0, addHours: number = 1): string => {
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    // Para la fecha de fin, sumamos 1 hora por defecto si no es edición
    if (!hours && !minutes && addHours) {
        d.setHours(d.getHours() + addHours);
    }
    // Aseguramos el formato YYYY-MM-DDTHH:MM
    return d.toISOString().slice(0, 16);
};


// --- 3. COMPONENTE PRINCIPAL ---

export const ReservaEscenarioForm: React.FC<ReservaEscenarioFormProps> = ({
    fechaSeleccionada,
    escenarios,
    currentCompanyId,
    reservaAEditar,
    onGuardar,
    onCancelar,
}) => {

    const { enqueueSnackbar } = useSnackbar(); // O reemplaza por tu sistema de notificaciones
    const isEditing = !!reservaAEditar;
    const initialEscenarioId = escenarios.length > 0 ? escenarios[0].id : null;

    // Inicializar el estado del formulario
    const [formData, setFormData] = useState<ReservaFormData>(() => {
        if (isEditing && reservaAEditar) {
            // EDICIÓN: Carga los datos existentes
            return {
                idEscenario: reservaAEditar.idEscenario,
                // Las fechas deben ser formateadas a la entrada local
                fechaInicio: reservaAEditar.fechaInicio.slice(0, 16),
                fechaFin: reservaAEditar.fechaFin.slice(0, 16),
                detalle: reservaAEditar.detalle,
            };
        } else {
            // NUEVA RESERVA: Usa la fecha seleccionada por defecto
            return {
                idEscenario: initialEscenarioId,
                fechaInicio: formatDateTimeLocal(fechaSeleccionada, 9, 0, 0), // 9:00 AM
                fechaFin: formatDateTimeLocal(fechaSeleccionada, 9, 0, 1),   // 10:00 AM (1 hora de duración)
                detalle: '',
            };
        }
    });

    const [cargando, setCargando] = useState(false);
    const [errorDisponibilidad, setErrorDisponibilidad] = useState('');

    // --- Handlers de Interacción ---

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Convertir idEscenario a número (ya que el value de select es string)
        setFormData(prev => ({
            ...prev,
            [name]: name === 'idEscenario' ? parseInt(value) : value
        }));
        setErrorDisponibilidad(''); // Limpiar error al cambiar los datos
    }, []);

    // --- Lógica de Disponibilidad (Conexión al Backend) ---

    const verificarDisponibilidad = async (data: ReservaFormData): Promise<boolean> => {
        if (!data.idEscenario) return false;

        console.log("Verificando disponibilidad en el backend...");

        try {
            const payload = {
                idEscenario: data.idEscenario,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                // Si estamos editando, se envía el ID de la reserva a excluir de la comprobación
                excludeId: isEditing ? reservaAEditar!.id : null
            };

            // 🚨 INTEGRACIÓN LARAVEL: Llama al endpoint de disponibilidad POST /api/reservas-escenario/disponibilidad
            const response = await axios.post('/api/reservas-escenario/disponibilidad', payload);

            // El backend debe devolver un booleano o un mensaje de error
            const isAvailable = response.data.available;

            if (!isAvailable) {
                setErrorDisponibilidad('El escenario no está disponible en el horario seleccionado.');
                return false;
            }
            return true;

        } catch (error) {
            // ✅ CORRECCIÓN 1: Manejar 'error' como unknown y verificar si es AxiosError
            let errorMessage = 'Error de conexión al verificar disponibilidad.';

            // Si el error es de Axios y tiene una respuesta
            if (axios.isAxiosError(error) && error.response) {
                // Si el backend devuelve un mensaje de error específico
                errorMessage = error.response.data.error || error.response.data.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            enqueueSnackbar(errorMessage, { variant: 'error' });
            return false;
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cargando || !formData.idEscenario) return;

        setCargando(true);
        setErrorDisponibilidad('');

        // 1. Validaciones básicas del Frontend
        const fechaInicio = new Date(formData.fechaInicio);
        const fechaFin = new Date(formData.fechaFin);

        if (fechaFin <= fechaInicio) {
            enqueueSnackbar('La hora de fin debe ser posterior a la de inicio.', { variant: 'warning' });
            setCargando(false);
            return;
        }
        if (fechaInicio < new Date()) {
            enqueueSnackbar('No se pueden crear reservas en el pasado.', { variant: 'warning' });
            setCargando(false);
            return;
        }

        // 2. Comprobar Disponibilidad con el Backend
        const isAvailable = await verificarDisponibilidad(formData);
        if (!isAvailable) {
            setCargando(false);
            return;
        }

        // 3. Preparación de Datos Finales para el CRUD
        const finalData = {
            ...formData,
            idCompany: currentCompanyId,
            // Laravel puede necesitar la fecha en formato ISO completo
            fechaInicio: new Date(formData.fechaInicio).toISOString(),
            fechaFin: new Date(formData.fechaFin).toISOString(),
            estado: 'ACTIVO', // Por defecto al crear
        };

        // 4. Llamada al API para Guardar
        try {
            let response;
            if (isEditing) {
                // PUT /api/reservas-escenario/{id}
                response = await axios.put(`/api/reservas-escenario/${reservaAEditar!.id}`, finalData);
            } else {
                // POST /api/reservas-escenario
                response = await axios.post('/api/reservas-escenario', finalData);
            }

            enqueueSnackbar(`Reserva ${isEditing ? 'actualizada' : 'creada'} con éxito!`, { variant: 'success' });
            onGuardar(); // Cierra el modal y refresca el calendario

        } catch (error) {
            // ✅ CORRECCIÓN 2: Manejar 'error' como unknown y verificar si es AxiosError
            let apiError = 'Error desconocido al guardar la reserva.';

            if (axios.isAxiosError(error) && error.response) {
                // El backend de Laravel a menudo usa 'message' para errores de validación
                apiError = error.response.data.message || apiError;
            } else if (error instanceof Error) {
                apiError = error.message;
            }

            enqueueSnackbar(`Error: ${apiError}`, { variant: 'error' });
        } finally {
            setCargando(false);
        }
    };


    // --- 4. Renderizado de la UI (Estilos Tailwind) ---

    if (escenarios.length === 0) {
        return (
            <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded-lg">
                ❌ No hay escenarios disponibles para reservar.
                <button onClick={onCancelar} className="px-3 py-1 mt-3 text-sm bg-gray-300 rounded-md">Cerrar</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="pb-3 text-xl font-bold text-gray-800 border-b">
                {isEditing ? 'Modificar Reserva' : 'Nueva Reserva de Escenario'}
            </h3>


            {/* 1. Selector de Escenario */}
            <div>
                <label htmlFor="idEscenario" className="block text-sm font-medium text-gray-700">
                    Escenario 🏟️ <span className="text-red-500">*</span>
                </label>
                <select
                    id="idEscenario"
                    name="idEscenario"
                    value={formData.idEscenario || ''}
                    onChange={handleChange}
                    required
                    className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    // No permitir cambiar escenario si se está editando una reserva existente
                    disabled={cargando || isEditing}
                >
                    <option value="" disabled>Selecciona un escenario</option>
                    {escenarios.map(esc => (
                        <option key={esc.id} value={esc.id}>
                            {esc.nombre} (Capacidad: {esc.capacidad})
                        </option>
                    ))}
                </select>
            </div>

            {/* 2. Fechas de Reserva */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
                        Fecha y Hora de Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        id="fechaInicio"
                        name="fechaInicio"
                        value={formData.fechaInicio}
                        onChange={handleChange}
                        required
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        disabled={cargando}
                    />
                </div>
                <div>
                    <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">
                        Fecha y Hora de Fin <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        id="fechaFin"
                        name="fechaFin"
                        value={formData.fechaFin}
                        onChange={handleChange}
                        required
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        disabled={cargando}
                    />
                </div>
            </div>

            {/* 3. Mensaje de Disponibilidad/Error */}
            {errorDisponibilidad && (
                <p className="p-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">
                    ⚠️ {errorDisponibilidad}
                </p>
            )}

            {/* 4. Detalle / Notas */}
            <div>
                <label htmlFor="detalle" className="block text-sm font-medium text-gray-700">
                    Detalles de la Reserva (Opcional)
                </label>
                <textarea
                    id="detalle"
                    name="detalle"
                    rows={3}
                    value={formData.detalle}
                    onChange={handleChange}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    disabled={cargando}
                />
            </div>

            {/* 5. Botones de Acción */}
            <div className="flex justify-end pt-2 space-x-3">
                <button
                    type="button"
                    onClick={onCancelar}
                    disabled={cargando}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={cargando}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                    {cargando ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Reservar Escenario'}
                </button>
            </div>
        </form>
    );
};