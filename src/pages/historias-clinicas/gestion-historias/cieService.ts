import axios from 'axios';

export const obtenerCieDiagnosticos = async () => {
  const response = await axios.get('/cie/listar-codigos');
  // Se espera que cada item tenga: id, codigo, descripcion
  return response.data;
};
