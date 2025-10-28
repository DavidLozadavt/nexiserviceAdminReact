import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Prestador } from './types';

interface ModalConfigServicioProps {
  open: boolean;
  data?: any;
  onClose: () => void;
  onSave: () => void;
}

const ModalConfigServicio = ({ open, data, onClose, onSave }: ModalConfigServicioProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const [escenarios, setEscenarios] = useState<any[]>([]);
  const [escenarioSeleccionado, setEscenarioSeleccionado] = useState<number | ''>('');

  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState<number | ''>('');


  // Cargar escenarios desde backend
  const fetchEscenarios = async () => {
    try {
      const res = await axios.get('/escenarios');
      setEscenarios(res.data);
    } catch (error) {
      enqueueSnackbar('Error al cargar los escenarios', { variant: 'error' });
    }
  };

  // Cargar prestadores desde backend
  const fetchPrestadores = async () => {
    try {
      const res = await axios.get(`/get_prestadores_company/${data?.idCompany}`);
      const formatted: Prestador[] = res.data.map((p: any) => ({
        id: p.idPersona,
        nombreCompleto: `${p.persona.nombre1} ${p.persona.apellido1}`,
        persona: {
          id: p.persona.id,
          nombre1: p.persona.nombre1,
          apellido1: p.persona.apellido1,
          nombreCompleto: `${p.persona.nombre1} ${p.persona.apellido1}`,
        },
        servicios: p.servicios ?? [],
      }));
      setPrestadores(formatted);
    } catch (error) {
      enqueueSnackbar('Error al cargar los prestadores', { variant: 'error' });
    }
  };

  // Cargar datos al abrir
  useEffect(() => {
    if (open) {
      fetchEscenarios();
      fetchPrestadores();
      setEscenarioSeleccionado('');
    }
  }, [open]);

  const handleSave = async () => {
    if (!escenarioSeleccionado) {
      enqueueSnackbar('Debes seleccionar un escenario', { variant: 'warning' });
      return;
    }

    try {
      await axios.post(`/asignar_servicio_escenario`, {
        servicio_id: data?.id,
        prestador_id: prestadorSeleccionado,
        escenario_id: escenarioSeleccionado,
      });
      enqueueSnackbar('Escenario asignado correctamente', { variant: 'success' });
      onSave();
      onClose();
    } catch (error) {
      enqueueSnackbar('Error al asignar el escenario', { variant: 'error' });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>
            Asignación de Escenario/Prestador
          </ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="grid gap-3 px-0 py-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio:</label>
            <input
              type="text"
              value={data?.nombre || ''}
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Escenarios:</label>
            <select
              className="input border rounded-md w-full p-2"
              value={escenarioSeleccionado}
              onChange={(e) => setEscenarioSeleccionado(Number(e.target.value))}
            >
              <option value="">Selecciona escenario</option>
              {escenarios.map((esc) => (
                <option key={esc.id} value={esc.id}>
                  {esc.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Prestador */}
          <div>
            <label className="block mb-1 text-sm font-medium">Prestador:</label>
            <select
              className="input border rounded-md w-full p-2"
              value={prestadorSeleccionado}
              onChange={(e) =>
                setPrestadorSeleccionado(e.target.value === '' ? '' : Number(e.target.value))
              }
            >
              <option value="">Selecciona prestador</option>
              {prestadores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombreCompleto}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type='button' onClick={onClose} className="btn btn-sm btn-secondary">
              Cancelar
            </button>

            <button
              type='button' onClick={handleSave} className="btn btn-sm btn-primary">
              Aceptar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalConfigServicio };
