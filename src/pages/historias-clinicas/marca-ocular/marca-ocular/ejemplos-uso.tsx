/**
 * Ejemplo de uso del componente MarcaOcularContent con integración al backend
 * 
 * Este archivo muestra cómo usar el componente en diferentes escenarios
 */

import React, { useState } from 'react';
import MarcaOcularContent from './MarcaOcularContent';

// ===============================================
// EJEMPLO 1: Uso básico con IDs hardcodeados
// ===============================================
export const EjemploBasico = () => {
  const [reload, setReload] = useState(false);

  return (
    <MarcaOcularContent
      pacienteId="PAC-12345"
      consultaId="CONS-67890"
      reload={reload}
    />
  );
};

// ===============================================
// EJEMPLO 2: Uso con datos de URL params
// ===============================================
import { useParams } from 'react-router-dom';

export const EjemploConParams = () => {
  const { pacienteId, consultaId } = useParams();
  const [reload, setReload] = useState(false);

  return (
    <MarcaOcularContent
      pacienteId={pacienteId}
      consultaId={consultaId}
      reload={reload}
    />
  );
};

// ===============================================
// EJEMPLO 3: Uso con contexto de autenticación
// ===============================================
import { useAuthContext } from '@/auth';

export const EjemploConAuth = () => {
  const { user } = useAuthContext();
  const [reload, setReload] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string>('');

  return (
    <div>
      {/* Selector de paciente */}
      <div className="mb-5">
        <label className="form-label">Seleccionar Paciente</label>
        <select
          className="select"
          value={pacienteSeleccionado}
          onChange={(e) => setPacienteSeleccionado(e.target.value)}
        >
          <option value="">-- Seleccione un paciente --</option>
          <option value="PAC-001">Juan Pérez</option>
          <option value="PAC-002">María García</option>
          <option value="PAC-003">Carlos López</option>
        </select>
      </div>

      {/* Componente de marca ocular */}
      {pacienteSeleccionado && (
        <MarcaOcularContent
          pacienteId={pacienteSeleccionado}
          consultaId={`CONS-${Date.now()}`}
          reload={reload}
        />
      )}
    </div>
  );
};

// ===============================================
// EJEMPLO 4: Integración completa con formulario de consulta
// ===============================================
interface FormularioConsultaProps {
  onGuardar?: () => void;
}

export const FormularioConsultaCompleto = ({ onGuardar }: FormularioConsultaProps) => {
  const [reload, setReload] = useState(false);
  const [pacienteId, setPacienteId] = useState<string>('');
  const [consultaId, setConsultaId] = useState<string>('');
  const [diagnostico, setDiagnostico] = useState<string>('');
  const [tratamiento, setTratamiento] = useState<string>('');

  const handleGuardarConsulta = async () => {
    try {
      // Aquí guardarías toda la consulta incluyendo las marcas oculares
      const datosConsulta = {
        pacienteId,
        consultaId,
        diagnostico,
        tratamiento,
        fecha: new Date().toISOString()
      };

      // Llamada al backend
      const response = await fetch('/api/consultas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosConsulta)
      });

      if (response.ok) {
        alert('Consulta guardada exitosamente');
        onGuardar?.();
      }
    } catch (error) {
      console.error('Error al guardar consulta:', error);
    }
  };

  return (
    <div className="grid gap-5">
      {/* Datos de la consulta */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Datos de la Consulta</h3>
        </div>
        <div className="card-body grid gap-5">
          <div>
            <label className="form-label">ID Paciente</label>
            <input
              type="text"
              className="input"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              placeholder="PAC-12345"
            />
          </div>

          <div>
            <label className="form-label">ID Consulta</label>
            <input
              type="text"
              className="input"
              value={consultaId}
              onChange={(e) => setConsultaId(e.target.value)}
              placeholder="CONS-67890"
            />
          </div>

          <div>
            <label className="form-label">Diagnóstico</label>
            <textarea
              className="input"
              rows={3}
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              placeholder="Describa el diagnóstico..."
            />
          </div>

          <div>
            <label className="form-label">Tratamiento</label>
            <textarea
              className="input"
              rows={3}
              value={tratamiento}
              onChange={(e) => setTratamiento(e.target.value)}
              placeholder="Describa el tratamiento..."
            />
          </div>
        </div>
      </div>

      {/* Componente de marca ocular */}
      {pacienteId && (
        <MarcaOcularContent
          pacienteId={pacienteId}
          consultaId={consultaId}
          reload={reload}
        />
      )}

      {/* Botones de acción */}
      <div className="card">
        <div className="card-body flex justify-end gap-3">
          <button className="btn btn-light">Cancelar</button>
          <button className="btn btn-primary" onClick={handleGuardarConsulta}>
            Guardar Consulta Completa
          </button>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// EJEMPLO 5: Uso en modal
// ===============================================
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';

interface ModalMarcaOcularProps {
  open: boolean;
  onClose: () => void;
  pacienteId: string;
  consultaId?: string;
}

export const ModalMarcaOcular = ({ 
  open, 
  onClose, 
  pacienteId, 
  consultaId 
}: ModalMarcaOcularProps) => {
  const [reload, setReload] = useState(false);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[1400px] top-[5%]">
        <ModalHeader>
          <ModalTitle>Marcas Oculares - Paciente {pacienteId}</ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="p-5">
          <MarcaOcularContent
            pacienteId={pacienteId}
            consultaId={consultaId}
            reload={reload}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// ===============================================
// EJEMPLO 6: Uso con historial de marcas
// ===============================================
export const HistorialMarcasOculares = () => {
  const [pacienteId] = useState('PAC-12345');
  const [consultaSeleccionada, setConsultaSeleccionada] = useState<string>('');
  const [reload, setReload] = useState(false);

  // Lista de consultas previas (esto vendría del backend)
  const consultasPrevias = [
    { id: 'CONS-001', fecha: '2025-11-20', medico: 'Dr. Pérez' },
    { id: 'CONS-002', fecha: '2025-11-15', medico: 'Dra. García' },
    { id: 'CONS-003', fecha: '2025-11-10', medico: 'Dr. Pérez' }
  ];

  return (
    <div className="grid gap-5">
      {/* Selector de consulta */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Historial de Consultas</h3>
        </div>
        <div className="card-body">
          <label className="form-label">Seleccionar Consulta</label>
          <select
            className="select"
            value={consultaSeleccionada}
            onChange={(e) => setConsultaSeleccionada(e.target.value)}
          >
            <option value="">-- Nueva Consulta --</option>
            {consultasPrevias.map((consulta) => (
              <option key={consulta.id} value={consulta.id}>
                {consulta.fecha} - {consulta.medico}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Componente de marca ocular */}
      <MarcaOcularContent
        pacienteId={pacienteId}
        consultaId={consultaSeleccionada || `CONS-NEW-${Date.now()}`}
        reload={reload}
      />
    </div>
  );
};

// ===============================================
// EJEMPLO 7: Datos de prueba para desarrollo
// ===============================================
export const datosEjemplo = {
  marcasOculares: {
    ojoDerecho: [
      {
        id: 'ojoDerecho-1732800000000',
        x: 45.5,
        y: 52.3,
        tipo: 'anomalia',
        color: '#ef4444',
        descripcion: 'Pequeña mancha rojiza en la córnea',
        fecha: '28/11/2025, 10:30:45'
      },
      {
        id: 'ojoDerecho-1732800050000',
        x: 30.0,
        y: 70.5,
        tipo: 'lesion',
        color: '#f59e0b',
        descripcion: 'Área de inflamación',
        fecha: '28/11/2025, 10:30:50'
      }
    ],
    ojoIzquierdo: [
      {
        id: 'ojoIzquierdo-1732800100000',
        x: 60.2,
        y: 40.8,
        tipo: 'mancha',
        color: '#8b5cf6',
        descripcion: 'Mancha pigmentada en el iris',
        fecha: '28/11/2025, 10:31:00'
      }
    ]
  }
};
