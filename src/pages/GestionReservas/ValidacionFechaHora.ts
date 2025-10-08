// gestion-reserva/ValidacionFechaHora.ts

/**
 * Verifica si una combinación de fecha y hora es inválida debido a: 
 * 1. Día de la semana (no domingos).
 * 2. Horario de negocio (7:00 AM a 4:59 PM).
 * 3. Que no sea una hora pasada.
 * * @param dateObj La fecha seleccionada (objeto Date).
 * @param timeString La hora en formato "HH:MM" (string).
 * @returns Un string con el mensaje de error si es inválida, o null si es válida.
 */
export const validateReservation = (
    dateObj: Date, 
    timeString: string
): string | null => {
    
    // 1. Preparación del objeto Date/Time
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const checkDateTime = new Date(
        dateObj.getFullYear(), 
        dateObj.getMonth(), 
        dateObj.getDate(), 
        hours, 
        minutes
    );
    
    const now = new Date();
    
    // --- VERIFICACIÓN 1: DÍA DE LA SEMANA (DOMINGO) ---
    // getDay() devuelve 0 para Domingo, 1 para Lunes...
    if (dateObj.getDay() === 0) { 
        return "⛔ Error: No se permiten reservas los días domingos.";
    }

    // --- VERIFICACIÓN 2: RESTRICCIÓN DE HORARIO ---
    // Horario permitido: 7:00 AM (inclusive) hasta 4:59 PM (exclusive de 5 PM).
    // Horario restringido: 5:00 PM (17h) hasta 6:59 AM (6h).
    const hour24 = checkDateTime.getHours();

    if (hour24 >= 17 || hour24 < 7) { 
        return "⚠️ Error: Solo se pueden hacer reservas entre las 7:00 AM y las 4:59 PM.";
    }
    
    // --- VERIFICACIÓN 3: FECHA/HORA PASADA ---
    // Incluye el segundo actual para precisión.
    if (checkDateTime.getTime() <= now.getTime()) {
        return "❌ Error: La fecha y hora seleccionada ya han pasado.";
    }
    
    // Si todas las verificaciones pasan
    return null;
};