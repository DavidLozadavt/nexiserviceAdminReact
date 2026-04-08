import React, { useState, useEffect } from 'react';
import { BusquedaPaciente } from '../gestion-pacientes/components/BusquedaPaciente';
import { consultarPacientePorCC } from '../gestion-pacientes/pacientesService';
import { PacienteCard } from '../gestion-pacientes/components/PacienteCard';
import { GestionHistorias } from '../gestion-historias/GestionHistorias';
import { obtenerHistoriasClinicasPorPersonaId } from '../gestion-historias/historiaClinicaService';

const EvolucionPage: React.FC = () => {
  const [identificacion, setIdentificacion] = useState('');
  const [paciente, setPaciente] = useState<any | null>(null);
  const [historias, setHistorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuscar = async (cc?: string) => {
    const doc = cc ?? identificacion;
    if (!doc) {
      setError('Ingresa número de identificación');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await consultarPacientePorCC(String(doc));
      if (!data) {
        setPaciente(null);
        setHistorias([]);
        setError('Paciente no encontrado');
      } else {
        setPaciente(data);
        // Cargar historias
        try {
          const hs = await obtenerHistoriasClinicasPorPersonaId(String(data.id || data.persona_id || data.documento));
          setHistorias(Array.isArray(hs) ? hs : []);
        } catch (e) {
          setHistorias([]);
        }
      }
    } catch (e) {
      setError('Error al buscar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Evolución de Historia</h1>
        <p className="text-lg text-gray-600 dark:text-gray-700 mb-6">Busca por cédula y administra evoluciones de las historias existentes.</p>

        <BusquedaPaciente
          identificacion={identificacion}
          onIdentificacionChange={setIdentificacion}
          onBuscar={() => handleBuscar(identificacion)}
        />

        {loading && <div>Cargando...</div>}
        {error && <div className="text-danger">{error}</div>}

        {paciente && (
          <div>
            <PacienteCard
              paciente={{
                id: paciente.id || paciente.persona_id || '',
                identificacion: paciente.documento || paciente.identificacion || '',
                nombre: paciente.nombre || `${paciente.nombre1 || ''} ${paciente.apellido1 || ''}`.trim(),
                nombre1: paciente.nombre1 || paciente.nombre || '',
                apellido1: paciente.apellido1 || '',
                direccion: paciente.direccion || '',
                email: paciente.email || '',
                telefono: paciente.telefono || '',
                tipoIdentificacion: paciente.tipoIdentificacion || '',
                idCiudad: paciente.ciudad || '',
                sexo: paciente.sexo || '',
                fechaNac: paciente.fecha_nacimiento || '',
                eps: paciente.eps || ''
              }}
              onVerHistoria={() => {}}
              onVerDocumentos={() => {}}
              onVerSeguimiento={() => {}}
            />

            <div className="mt-6">
              <GestionHistorias paciente={patientAdapter(paciente)} setHistoriasPaciente={(h) => setHistorias(h)} allowCrearHistoria={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Adaptador ligero para pasar el objeto que espera GestionHistorias
function patientAdapter(p: any) {
  return {
    id: p.id || p.persona_id || '',
    identificacion: p.documento || p.identificacion || '',
    nombre: p.nombre || `${p.nombre1 || ''} ${p.apellido1 || ''}`.trim(),
    nombre1: p.nombre1 || p.nombre || '',
    apellido1: p.apellido1 || '',
    direccion: p.direccion || '',
    email: p.email || '',
    telefono: p.telefono || '',
    tipoIdentificacion: p.tipoIdentificacion || '',
    idCiudad: p.ciudad || '',
    sexo: p.sexo || '',
    fechaNac: p.fecha_nacimiento || '',
    eps: p.eps || ''
  };
}

export default EvolucionPage;
