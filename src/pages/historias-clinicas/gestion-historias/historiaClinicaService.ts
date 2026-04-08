// Adjuntar archivo a una historia clínica existente
export const adjuntarArchivoAHistoria = async (historiaId: string | number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/${historiaId}/adjuntos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
// Obtener antecedentes de una historia clínica por id
export const obtenerAntecedentesPorHistoriaId = async (historiaId: number | string) => {
  const response = await axios.get(`${API_URL}/${historiaId}/antecedentes`);
  return response.data;
};
// Obtener historias clínicas por persona_id
export const obtenerHistoriasClinicasPorPersonaId = async (personaId: string) => {
  const response = await axios.get(`${API_URL}?persona_id=${personaId}`);
  return response.data;
};

import axios from 'axios';

// Puedes ajustar la URL base según tu backend
const API_URL = '/historias-clinicas';

export const obtenerHistoriasClinicas = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const obtenerHistoriaClinicaPorId = async (id: number) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const crearHistoriaClinica = async (data: any) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const actualizarHistoriaClinica = async (id: number, data: any) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const eliminarHistoriaClinica = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
