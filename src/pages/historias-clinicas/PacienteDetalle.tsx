
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PacienteCard } from '@/pages/historias-clinicas/gestion-pacientes/components/PacienteCard';
import { GestionHistorias } from '@/pages/historias-clinicas/gestion-historias/GestionHistorias';
import { Paciente } from '@/pages/historias-clinicas/gestion-pacientes/types';
import { consultarPacientePorCC } from '@/pages/historias-clinicas/gestion-pacientes/pacientesService';
import { ModalOverlay } from '@/pages/historias-clinicas/gestion-pacientes/components/ModalOverlay';


export const PacienteDetalle: React.FC = () => {
  const { id } = useParams();
  const [mostrarHistorias, setMostrarHistorias] = useState(false);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaciente = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const data = await consultarPacientePorCC(String(id));
          if (data) {
            setPaciente(data);
          } else {
            setError('Paciente no encontrado');
          }
        } else {
          setError('ID de paciente no proporcionado');
        }
      } catch (e) {
        setError('Error al cargar el paciente');
      } finally {
        setLoading(false);
      }
    };
    fetchPaciente();
  }, [id]);

  if (loading) return <div>Cargando paciente...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!paciente) return null;

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
