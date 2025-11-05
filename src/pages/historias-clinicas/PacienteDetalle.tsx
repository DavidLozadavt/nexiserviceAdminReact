
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PacienteCard } from '@/pages/historias-clinicas/gestion-pacientes/components/PacienteCard';
import { GestionHistorias } from '@/pages/historias-clinicas/gestion-historias/GestionHistorias';
import { Paciente } from '@/pages/historias-clinicas/gestion-pacientes/types';
import { ModalOverlay } from '@/pages/historias-clinicas/gestion-pacientes/components/ModalOverlay';

const pacienteMock: Paciente = {
  id: '1',
  identificacion: '1234567890',
  nombre: 'Juan Carlos Pérez García',
  nombre1: 'Juan Carlos',
  apellido1: 'Pérez García',
  direccion: 'Calle Falsa 123',
  email: 'juan.perez@example.com',
  telefono: '',
  tipoIdentificacion: 'CC',
  idCiudad: 'Bogotá',
  sexo: 'M',
  fechaNac: '1985-05-15',
  eps: 'EPS Salud Total'
};

export const PacienteDetalle: React.FC = () => {
  const { id } = useParams();
  const [mostrarHistorias, setMostrarHistorias] = useState(false);

  // Aquí podrías buscar el paciente por id  backend
  const paciente = pacienteMock;

  return (
    <div>
      <PacienteCard
        paciente={paciente}
        onVerHistoria={() => setMostrarHistorias(true)}
        onVerDocumentos={() => {}}
        onVerSeguimiento={() => {}}
      />
      {mostrarHistorias && (
        <ModalOverlay>
          <GestionHistorias paciente={paciente} onClose={() => setMostrarHistorias(false)} />
        </ModalOverlay>
      )}
    </div>
  );
};
