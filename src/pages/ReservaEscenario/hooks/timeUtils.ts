/**
 * Convierte un número de minutos en un formato de horas y minutos.
 * @param totalMinutes La duración total en minutos (ej: 90).
 * @returns Cadena de texto con el formato Hh Mmin (ej: "1h 30min").
 */
export const addMinutesToDateTimeLocal = (dateTimeLocalString: string, minutes: number): string => {
    const date = new Date(dateTimeLocalString);
    
    date.setMinutes(date.getMinutes() + minutes);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${mins}`;
};

export const formatMinutesToHours = (totalMinutes: number | undefined | null): string => {
    if (totalMinutes === undefined || totalMinutes === null) {
        return 'N/A';
    }
    
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