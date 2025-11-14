/**
 * Convierte un número de minutos en un formato de horas y minutos.
 * @param totalMinutes La duración total en minutos (ej: 90).
 * @returns Cadena de texto con el formato Hh Mmin (ej: "1h 30min").
 */
export const addMinutesToDateTimeLocal = (dateTimeLocalString: string, minutes: number): string => {
    // 1. Crear un objeto Date usando el valor (el constructor lo interpreta en la zona horaria local).
    const date = new Date(dateTimeLocalString);
    
    // 2. Sumar los minutos. setMinutes manipula los minutos locales.
    date.setMinutes(date.getMinutes() + minutes);

    // 3. Formatear la fecha manualmente usando las partes *locales* (getFullYear, getMonth, etc.)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');

    // 4. Retornar el formato requerido por el input datetime-local
    return `${year}-${month}-${day}T${hours}:${mins}`;
};

export const formatMinutesToHours = (totalMinutes: number | undefined | null): string => {
    if (totalMinutes === undefined || totalMinutes === null) {
        return 'N/A';
    }
    
    // Aseguramos que sea un número entero (por si viene como string)
    const minutes = Math.floor(Number(totalMinutes));

    if (minutes <= 0) {
        return '0min';
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    let result = '';

    if (hours > 0) {
        result += `${hours}h`;
    }

    if (remainingMinutes > 0) {
        // Añade un espacio si ya hay horas
        if (result.length > 0) {
            result += ' ';
        }
        result += `${remainingMinutes}min`;
    }

    return result;
};