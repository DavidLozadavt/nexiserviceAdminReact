
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

  const handleBuscar = async (idOverrride?: string) => {
    const idToSearch = idOverrride || identificacion;
    setMensaje('');
    if (!idToSearch.trim()) {
      setPacienteEncontrado(null);
      setShowForm(false);
      setMensaje('Por favor ingresa una identificación válida.');
      setTipoMensaje('warning');
      return null;
    }
    
    try {
      const data = await consultarPacientePorCC(idToSearch);
      if (data) {
        const paciente = {
          id: data.id || '',
          identificacion: data.documento || data.identificacion || '',
          nombre: data.nombre || `${data.nombre1 || ''} ${data.apellido1 || ''}`.trim() || '',
          nombre1: data.nombre1 || '',
          apellido1: data.apellido1 || '',
          direccion: data.direccion || '',
          email: data.email || '',
          telefono: data.telefono || data.celular || '',
          tipoIdentificacion: data.tipoIdentificacion || '',
          idCiudad: data.ciudad || '',
          sexo: data.sexo || '',
          fechaNac: data.fecha_nacimiento || data.fechaNac || '',
          eps: data.eps || '',
          departamento: data.departamento || '',
          acudiente: data.acudiente || ''
        };
        setPacienteEncontrado(paciente);
        setShowForm(false);
        setMensaje('Paciente encontrado exitosamente.');
        setTipoMensaje('success');
        return paciente;
      } else {
        setPacienteEncontrado(null);
        setMensaje('Paciente no encontrado en la base de datos.');
        setTipoMensaje('warning');
        return null;
      }
    } catch (error) {
      setMensaje('Error al buscar el paciente.');
      setTipoMensaje('error');
      return null;
    }
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
    const searchId = pacienteId ? String(pacienteId) : identificacion;
    
    if (searchId) {
      try {
        const data = await consultarPacientePorCC(searchId);
        if (data) {
          paciente = {
            id: data.id || '',
            identificacion: data.documento || data.identificacion || '',
            nombre: data.nombre || `${data.nombre1 || ''} ${data.apellido1 || ''}`.trim() || '',
            nombre1: data.nombre1 || data.nombre || '',
            apellido1: data.apellido1 || '',
            direccion: data.direccion || '',
            email: data.email || '',
            telefono: data.telefono || data.celular || '',
            tipoIdentificacion: data.tipoIdentificacion || '',
            idCiudad: data.ciudad || '',
            sexo: data.sexo || '',
            fechaNac: data.fecha_nacimiento || data.fechaNac || '',
            eps: data.eps || '',
            departamento: data.departamento || '',
            acudiente: data.acudiente || ''
          };
        }
      } catch (error) {
        console.error("Error fetching history patient:", error);
      }
    }
    
    if (!paciente) {
      setPacienteEncontrado(null);
      setMensaje('Paciente no encontrado en la base de datos.');
      setTipoMensaje('warning');
      return null;
    }
    setPacienteEncontrado(paciente);
    setShowDocumentosModal(false);
    return paciente;
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