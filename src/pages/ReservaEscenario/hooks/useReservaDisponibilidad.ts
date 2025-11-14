import { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';

// Función de Debounce
const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]): void => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

interface DisponibilidadResult {
    available: boolean;
    message: string;
}

// =========================================================
// FUNCIÓN DE LIMPIEZA DE FECHA/HORA (Para evitar error 422)
// =========================================================

/**
 * Asegura que la cadena de fecha tenga el formato YYYY-MM-DDTHH:mm:00.
 * Esto previene errores 422 si el input datetime-local añade segundos/milisegundos
 * o si el backend requiere el formato ISO 8601 completo con segundos.
 */
const cleanDateTime = (dateTimeStr: string): string => {
    if (!dateTimeStr || typeof dateTimeStr !== 'string') return '';
    // Toma solo la parte hasta los minutos (YYYY-MM-DDTHH:mm)
    const base = dateTimeStr.substring(0, 16); 
    // Añade los segundos en '00'
    return base + ':00'; 
};

// =========================================================


/**
 * Hook personalizado para validar la disponibilidad de un escenario en tiempo real.
 * @param escenarioId ID del escenario.
 * @param fechaInicio Fecha y hora de inicio (YYYY-MM-DDTHH:mm:ss).
 * @param fechaFin Fecha y hora de fin (YYYY-MM-DDTHH:mm:ss).
 * @param excludeId ID de la reserva a excluir (para modo edición).
 */
export const useReservaDisponibilidad = (
    escenarioId: number | null,
    fechaInicio: string,
    fechaFin: string,
    excludeId: number | null
) => {
    const [errorDisponibilidad, setErrorDisponibilidad] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 1. Función de llamada a la API (Memorizada)
    const checkDisponibilidadAPI = useCallback(async (): Promise<DisponibilidadResult> => {
        if (!escenarioId || !fechaInicio || !fechaFin) {
            setErrorDisponibilidad('');
            return { available: false, message: 'Faltan datos de tiempo o escenario.' };
        }

        setIsLoading(true);
        setErrorDisponibilidad('');
        
        // 🚨 Aplicar la limpieza aquí antes de enviar
        const formattedFechaInicio = cleanDateTime(fechaInicio);
        const formattedFechaFin = cleanDateTime(fechaFin);


        try {
            const params = {
                escenario_id: escenarioId,
                fecha_inicio: formattedFechaInicio, // 👈 Se envía la fecha limpia
                fecha_fin: formattedFechaFin,       // 👈 Se envía la fecha limpia
                ...(excludeId ? { exclude_id: excludeId } : {})
            };

            // Asegúrate de que tu endpoint es correcto (ej: /api/check_escenario_disponibilidad)
            const response = await axios.get('/check_escenario_disponibilidad', { params });

            // 200 OK
            setIsLoading(false);
            return { available: true, message: response.data.message };

        } catch (error) {
            setIsLoading(false);
            
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 409) {
                    // 409 Conflict (El escenario está ocupado)
                    const errorMessage = error.response.data.message || 'El escenario ya está reservado en ese lapso de tiempo.';
                    setErrorDisponibilidad(errorMessage);
                    return { available: false, message: errorMessage };
                } 
                
                if (error.response.status === 422) {
                    // 422 Unprocessable Content (Error de formato de fecha)
                    const errorMessage = 'Error de formato en la solicitud al servidor (422). Verifique la hora.';
                    setErrorDisponibilidad(errorMessage);
                    return { available: false, message: errorMessage };
                }
            }

            // Otros errores de red o servidor
            const genericError = 'Error al validar disponibilidad con el servidor.';
            setErrorDisponibilidad(genericError);
            return { available: false, message: genericError };
        }
    }, [escenarioId, fechaInicio, fechaFin, excludeId]);


    // 2. Handler Debounced
    const debouncedCheck = useMemo(() => {
        const check = () => {
            checkDisponibilidadAPI();
        };
        // Devolvemos la función debounced que llama a la función API
        return debounce(check, 700);
    }, [checkDisponibilidadAPI]);


    // 3. useEffect para ejecutar la validación al cambiar los parámetros
    useEffect(() => {
        // Solo ejecuta si los tres campos principales están llenos
        if (escenarioId && fechaInicio && fechaFin) {
            debouncedCheck();
        } else {
            // Limpiar errores si faltan datos
            setErrorDisponibilidad('');
        }

        // Limpieza: Cancelar cualquier validación pendiente al desmontar o re-ejecutar
        return () => {
            // Se asume que tu función debounce puede tener una propiedad 'cancel'
            (debouncedCheck as any).cancel && (debouncedCheck as any).cancel();
        };
    }, [escenarioId, fechaInicio, fechaFin, debouncedCheck]);

    
    // 4. Exponer la lógica
    return {
        errorDisponibilidad,
        isLoading,
        checkDisponibilidadAPI, // Exponer la función sin debounce para la validación final en submit
    };
};