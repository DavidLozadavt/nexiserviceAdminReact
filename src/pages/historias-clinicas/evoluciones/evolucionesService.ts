import axios from 'axios';

export const crearEvolucion = async (evolucionData: {
  historias_clinicas_id: number;
  fecha: string;
  descripcion: string;
  firma_digital?: string;
  responsable: string;
  proxima_cita?: string;
}) => {
  try {
    // Si no hay firma, enviar cadena vacía
    const payload = {
      ...evolucionData,
      firma_digital: evolucionData.firma_digital ?? '',
    };
    const response = await axios.post(
      `/historias-clinicas/${evolucionData.historias_clinicas_id}/evoluciones`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error al crear la evolución clínica:', error);
    throw error;
  }
};
