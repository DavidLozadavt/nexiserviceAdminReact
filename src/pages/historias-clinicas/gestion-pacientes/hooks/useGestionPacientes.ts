
import { useState, useEffect } from 'react';
import { Paciente } from '../types';
import { consultarPacientePorCC } from '../pacientesService';
import { useNavigate } from 'react-router-dom';

type MensajeTipo = 'success' | 'info' | 'warning' | 'error';

// Pacientes mock para pruebas, con ids iguales a los pacienteId de las citas mock
export const pacientesMock: Paciente[] = [
  {
    id: 'PAC001',
    identificacion: '1234567890',
    nombre: 'Juan Carlos Pérez García',
    nombre1: 'Juan Carlos',
    apellido1: 'Pérez García',
    direccion: 'Calle Falsa 123',
    email: 'juan.perez@example.com',
    telefono: '', // vacío para probar validación
    tipoIdentificacion: 'CC',
    idCiudad: 'Bogotá',
    sexo: 'M',
    fechaNac: '1985-05-15',
    eps: 'EPS Salud Total'
  },
  {
    id: 'PAC002',
    identificacion: '0987654321',
    nombre: 'María Fernanda López Ruiz',
    nombre1: 'María Fernanda',
    apellido1: 'López Ruiz',
    direccion: 'Calle 45 #12-34',
    email: '', // Falta email
    telefono: '3216549870',
    tipoIdentificacion: 'CC',
    idCiudad: 'Medellín',
    sexo: 'F',
    fechaNac: '1990-10-20',
    eps: 'EPS Sura'
  },
  {
    id: 'PAC003',
    identificacion: '5678901234',
    nombre: 'Carlos Alberto Rodríguez',
    nombre1: 'Carlos Alberto',
    apellido1: 'Rodríguez',
    direccion: '', // Falta dirección
    email: 'carlos.rodriguez@example.com',
    telefono: '3129876543',
    tipoIdentificacion: 'CC',
    idCiudad: 'Cali',
    sexo: 'M',
    fechaNac: '1982-03-15',
    eps: 'EPS Sanitas'
  },
  {
    id: 'PAC004',
    identificacion: '3456789012',
    nombre: 'Ana María Gómez Torres',
    nombre1: 'Ana María',
    apellido1: 'Gómez Torres',
    direccion: 'Carrera 7 #89-10',
    email: 'ana.gomez@example.com',
    telefono: '3001234567',
    tipoIdentificacion: 'CC',
    idCiudad: 'Barranquilla',
    sexo: 'F',
    fechaNac: '1995-07-30',
    eps: 'EPS Nueva EPS'
  }
];

export const useGestionPacientes = () => {
  console.log('[useGestionPacientes] Hook renderizado');


  const [identificacion, setIdentificacion] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>(pacientesMock);
  useEffect(() => {
    console.log('[useGestionPacientes] Estado pacientes:', pacientes);
  }, [pacientes]);
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<MensajeTipo>('info');
  const [pacienteParaHistoria, setPacienteParaHistoria] = useState<Paciente | null>(null);
  const [showDocumentosModal, setShowDocumentosModal] = useState(false);
  const [historiasPaciente, setHistoriasPaciente] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleBuscar = async () => {
    setMensaje('');
    if (!identificacion.trim()) {
      setPacienteEncontrado(null);
      setShowForm(false);
      setMensaje('Por favor ingresa una identificación válida.');
      setTipoMensaje('warning');
      return;
    }
    // Simula búsqueda y siempre retorna el pacienteMock
  // setPacienteEncontrado(pacienteMock); // Eliminar referencia obsoleta
    setShowForm(false);
    setMensaje('Paciente encontrado exitosamente.');
    setTipoMensaje('success');
  };

  const handleGuardar = (nuevoPaciente: Paciente) => {
    if (pacientes.some(p => p.identificacion === nuevoPaciente.identificacion)) {
      setMensaje('Ya existe un paciente registrado con esa identificación.');
      setTipoMensaje('error');
      return;
    }
    setPacientes([...pacientes, nuevoPaciente]);
    setShowForm(false);
    setPacienteEncontrado(nuevoPaciente);
    setMensaje('Paciente registrado exitosamente en el sistema.');
    setTipoMensaje('success');
  };

  const handleVerHistoria = async (pacienteId?: string) => {
    console.log('[handleVerHistoria] pacienteId recibido:', pacienteId);
    console.log('[handleVerHistoria] pacientes actuales:', pacientes);
    let paciente = pacientes[0] || null;
    if (pacienteId) {
      const encontrado = pacientes.find(p => p.id === pacienteId || p.identificacion === pacienteId);
      console.log('[handleVerHistoria] paciente encontrado:', encontrado);
      if (encontrado) {
        paciente = encontrado;
      }
    }
    if (!paciente) {
      console.log('[handleVerHistoria] No se encontró paciente, abortando.');
      return;
    }
  setPacienteEncontrado(paciente);
  setShowDocumentosModal(false);
  
  };

  const handleVerDocumentos = () => {
    setShowDocumentosModal(true);
    setPacienteParaHistoria(null);
  };

  const handleVerSeguimiento = () => {
  };

  const handleCerrarHistoria = () => {
    setPacienteParaHistoria(null);
  };

  const handleCerrarDocumentos = () => {
    setShowDocumentosModal(false);
  };

  const handleCancelarForm = () => {
  setShowForm(false);
  setPacienteEncontrado(null);
  };

  const handleMostrarHistorias = () => {
    if (pacienteEncontrado) {
      setPacienteParaHistoria(pacienteEncontrado);
    }
  };

  return {
    identificacion,
    pacientes,
    pacienteEncontrado,
    showForm,
    mensaje,
    tipoMensaje,
    pacienteParaHistoria,
    showDocumentosModal,
    historiasPaciente,
    
    setIdentificacion,
    setHistoriasPaciente,
    
    handleBuscar,
    handleGuardar,
  handleVerHistoria,
  handleMostrarHistorias,
    handleVerDocumentos,
    handleVerSeguimiento,
    handleCerrarHistoria,
    handleCerrarDocumentos,
    handleCancelarForm
  };
};