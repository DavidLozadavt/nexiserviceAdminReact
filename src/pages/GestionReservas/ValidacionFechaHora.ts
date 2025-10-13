// gestion-reserva/ValidacionFechaHora.ts

/**
 * Verifica si una combinación de fecha y hora es inválida por:
 * 1. Día de la semana (domingo).
 * 2. Horario de negocio (7:00 AM a 4:59 PM).
 * 3. Fecha y hora pasadas.
 * * @param dateObj La fecha seleccionada (objeto Date, idealmente a medianoche).
 * @param timeString La hora en formato "HH:MM" (string).
 * @returns Un string con el mensaje de error si es inválida, o null si es válida.
 */
export const validateReservation = (
    dateObj: Date, 
    timeString: string
): string | null => {
    
    // 1. Preparación del objeto Date/Time de la RESERVA (en contexto local)
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const checkDateTime = new Date(
        dateObj.getFullYear(), 
        dateObj.getMonth(), 
        dateObj.getDate(), 
        hours, 
        minutes
    );
    
    // 1.1. Obtener la hora actual para una comparación precisa
    const now = new Date(); 
    
    
    // --- VERIFICACIÓN 1: DÍA DE LA SEMANA (DOMINGO) ---
    // getDay() devuelve 0 para Domingo.
    if (checkDateTime.getDay() === 0) { 
        return "⛔ Error: No se permiten reservas los días domingos.";
    }

    // --- VERIFICACIÓN 2: RESTRICCIÓN DE HORARIO (7:00 a 16:59) ---
    const hour24 = checkDateTime.getHours();

    // Bloquea 5:00 PM (17h) hasta 6:59 AM (6h).
    if (hour24 >= 17 || hour24 < 7) { 
        return "⚠️ Error: Solo se pueden hacer reservas entre las 7:00 AM y las 4:59 PM.";
    }
    
    // --- VERIFICACIÓN 3: FECHA/HORA PASADA ---
    // Si el timestamp de la reserva es menor o igual al timestamp actual.
    if (checkDateTime.getTime() <= now.getTime()) {
        return "❌ Error: La fecha y hora seleccionada ya han pasado.";
    }
    
    // Si todas las verificaciones pasan
    return null;
};