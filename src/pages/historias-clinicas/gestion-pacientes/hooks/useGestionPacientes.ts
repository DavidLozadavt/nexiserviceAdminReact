
import { useState, useEffect } from 'react';
import { Paciente } from '../types';
import { consultarPacientePorCC } from '../pacientesService';
import { useNavigate } from 'react-router-dom';

type MensajeTipo = 'success' | 'info' | 'warning' | 'error';



export const useGestionPacientes = () => {


  const [identificacion, setIdentificacion] = useState('');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  useEffect(() => {
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

  const handleVerHistoria = async (pacienteId?: string | number) => {
    let paciente = null;
    if (pacienteId) {
      // Buscar por identificación
      const data = await consultarPacientePorCC(String(pacienteId));
      if (data) {
        // Log para depuración del id recibido
        console.log('[useGestionPacientes] Backend data.id:', data.id);
        // Adaptar los campos del backend a los que espera PacienteCard
        paciente = {
          id: data.id || '',
          identificacion: data.documento || '',
          nombre: data.nombre || '',
          nombre1: data.nombre1 || data.nombre || '',
          apellido1: data.apellido1 || '',
          direccion: data.direccion || '',
          email: data.email || '',
          telefono: data.telefono || '',
          tipoIdentificacion: data.tipoIdentificacion || '',
          idCiudad: data.ciudad || '',
          sexo: data.sexo || '',
          fechaNac: data.fecha_nacimiento || '',
          eps: data.eps || '',
          departamento: data.departamento || '',
          acudiente: data.acudiente || ''
        };
        // Log para depuración del id enviado al frontend
        console.log('[useGestionPacientes] pacienteEncontrado.id:', paciente.id);
      }
    }
    if (!paciente) {
      setMensaje('Paciente no encontrado en la base de datos.');
      setTipoMensaje('warning');
      return;
    }
    setPacienteEncontrado(paciente);
    setShowDocumentosModal(false);
  };

  const handleVerDocumentos = () => {
    setShowDocumentosModal(true);
    setPacienteParaHistoria(null);
  };

  const [showSeguimiento, setShowSeguimiento] = useState(false);
  const handleVerSeguimiento = () => {
    setShowSeguimiento(true);
  };
  const handleCerrarSeguimiento = () => {
    setShowSeguimiento(false);
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
    setShowForm, // Exponer para uso externo
    handleBuscar,
    handleGuardar,
    handleVerHistoria,
    handleMostrarHistorias,
    handleVerDocumentos,
    handleVerSeguimiento,
    handleCerrarSeguimiento,
    handleCerrarHistoria,
    handleCerrarDocumentos,
    handleCancelarForm,
    showSeguimiento
  };
};