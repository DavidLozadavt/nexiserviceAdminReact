
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
