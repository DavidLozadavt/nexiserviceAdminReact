import { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';

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


const cleanDateTime = (dateTimeStr: string): string => {
    if (!dateTimeStr || typeof dateTimeStr !== 'string') return '';
    const base = dateTimeStr.substring(0, 16); 
    return base + ':00'; 
};


export const useReservaDisponibilidad = (
    escenarioId: number | null,
    fechaInicio: string,
    fechaFin: string,
    excludeId: number | null
) => {
    const [errorDisponibilidad, setErrorDisponibilidad] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const checkDisponibilidadAPI = useCallback(async (): Promise<DisponibilidadResult> => {
        if (!escenarioId || !fechaInicio || !fechaFin) {
            setErrorDisponibilidad('');
            return { available: false, message: 'Faltan datos de tiempo o escenario.' };
        }

        setIsLoading(true);
        setErrorDisponibilidad('');
        
        const formattedFechaInicio = cleanDateTime(fechaInicio);
        const formattedFechaFin = cleanDateTime(fechaFin);


        try {
            const params = {
                escenario_id: escenarioId,
                fecha_inicio: formattedFechaInicio, 
                fecha_fin: formattedFechaFin,       
                ...(excludeId ? { exclude_id: excludeId } : {})
            };

            const response = await axios.get('/check_escenario_disponibilidad', { params });

            setIsLoading(false);
            return { available: true, message: response.data.message };

        } catch (error) {
            setIsLoading(false);
            
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 409) {
                    const errorMessage = error.response.data.message || 'El escenario ya está reservado en ese lapso de tiempo.';
                    setErrorDisponibilidad(errorMessage);
                    return { available: false, message: errorMessage };
                } 
                
                if (error.response.status === 422) {
                    const errorMessage = 'Error de formato en la solicitud al servidor (422). Verifique la hora.';
                    setErrorDisponibilidad(errorMessage);
                    return { available: false, message: errorMessage };
                }
            }

            const genericError = 'Error al validar disponibilidad con el servidor.';
            setErrorDisponibilidad(genericError);
            return { available: false, message: genericError };
        }
    }, [escenarioId, fechaInicio, fechaFin, excludeId]);


    const debouncedCheck = useMemo(() => {
        const check = () => {
            checkDisponibilidadAPI();
        };
        return debounce(check, 700);
    }, [checkDisponibilidadAPI]);


    useEffect(() => {
        if (escenarioId && fechaInicio && fechaFin) {
            debouncedCheck();
        } else {
            setErrorDisponibilidad('');
        }

        return () => {
            (debouncedCheck as any).cancel && (debouncedCheck as any).cancel();
        };
    }, [escenarioId, fechaInicio, fechaFin, debouncedCheck]);

    
    return {
        errorDisponibilidad,
        isLoading,
        checkDisponibilidadAPI, 
    };
};