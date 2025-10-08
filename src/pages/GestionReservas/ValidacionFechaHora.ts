// gestion-reserva/ValidacionFechaHora.ts

/**
 * Verifica si una combinación de fecha y hora es anterior a la hora actual.
 * @param dateObj La fecha seleccionada (objeto Date).
 * @param timeString La hora en formato "HH:MM" (string).
 * @returns true si la fecha/hora es pasada, false en caso contrario.
 */
export const isPastDateTime = (dateObj: Date, timeString: string): boolean => {
    // 1. Clonar la fecha seleccionada para manipular solo el año, mes y día
    const checkDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    // 2. Extraer la hora y minuto del string "HH:MM"
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // 3. Establecer la hora y minuto en el objeto Date
    checkDate.setHours(hours, minutes, 0, 0);

    // 4. Comparar con la hora actual
    const now = new Date();
    
    // Si la marca de tiempo a verificar es menor que la marca de tiempo actual, es pasado.
    return checkDate.getTime() < now.getTime();
};