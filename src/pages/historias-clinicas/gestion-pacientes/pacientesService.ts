export const obtenerTiposIdentificacion = async () => {
  const response = await axios.get('/tipo_identificaciones');
  return response.data;
};
import axios from 'axios';
import { Paciente } from './types';

export const obtenerPacientes = async (idEmpresa: number) => {
  const apiUrl = `/empresas/${idEmpresa}/pacientes`;
  const response = await axios.get(apiUrl);
  return response.data;
};

export const obtenerPacientePorId = async (idEmpresa: number, id: string) => {
  const apiUrl = `/empresas/${idEmpresa}/pacientes/${id}`;
  const response = await axios.get(apiUrl);
  return response.data;
};

export const crearPaciente = async (
  idEmpresa: number,
  data: Omit<Paciente, 'id'>
) => {
  const apiUrl = `store_person_tercero_paciente`;
  const payload = {
    ...data,
    idEmpresa,
    password: data.identificacion, 
  };
  const response = await axios.post(apiUrl, payload);
  return response.data;
};

export const actualizarPaciente = async (
  idEmpresa: number,
  id: string,
  data: any
) => {
  const apiUrl = `/empresas/${idEmpresa}/pacientes/${id}`;
  const response = await axios.put(apiUrl, data);
  return response.data;
};

export const obtenerDepartamentos = async () => {
  try {
    const response = await axios.get('/departamentos');
    return response.data;
  } catch (error) {
    console.error('Error al cargar los departamentos:', error);
    throw error;
  }
};

export const obtenerCiudadesPorDepartamento = async (idDepartamento: number) => {
  try {
    const response = await axios.get(`/ciudades/departamento/${idDepartamento}`);
    return response.data;
  } catch (error) {
    console.error('Error al cargar las ciudades:', error);
    throw error;
  }
};

export const consultarPacientePorCC = async (cc: string) => {
    try {
        const response = await axios.get(`/terceros_by_cc/${cc}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.warn('Paciente no encontrado:', cc);
            return null;
        }
        console.error('Error al consultar el paciente:', error);
        throw error;
    }
};

