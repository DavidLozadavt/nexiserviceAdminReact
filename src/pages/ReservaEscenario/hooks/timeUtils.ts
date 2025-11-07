/**
 * Convierte un número de minutos en un formato de horas y minutos.
 * @param totalMinutes La duración total en minutos (ej: 90).
 * @returns Cadena de texto con el formato Hh Mmin (ej: "1h 30min").
 */
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