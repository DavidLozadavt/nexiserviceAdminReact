import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import Select, { MultiValue } from 'react-select';
import { Prestador } from './types';

interface OptionType {
  value: number;
  label: string;
}

interface ModalConfigServicioProps {
  open: boolean;
  data?: any;
  onClose: () => void;
  onSave: () => void;
}

const ModalConfigServicio = ({ open, data, onClose, onSave }: ModalConfigServicioProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const [escenarios, setEscenarios] = useState<any[]>([]);
  const [escenariosSeleccionados, setEscenariosSeleccionados] = useState<OptionType[]>([]);

  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [prestadoresSeleccionados, setPrestadoresSeleccionados] = useState<OptionType[]>([]);

  // Variable de control para saber qué mostrar
  const [esTipoEscenario, setEsTipoEscenario] = useState<boolean>(false);

  // Cargar escenarios
  const fetchEscenarios = async () => {
    try {
      const res = await axios.get('/escenarios');
      setEscenarios(res.data);
    } catch (error) {
      enqueueSnackbar('Error al cargar los escenarios', { variant: 'error' });
    }
  };

  // Cargar prestadores
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

  const normalizarTexto = (texto: string = '') =>
      texto
        .toLowerCase()
        .normalize('NFD') // separa caracteres con tildes (á → a + ́)
        .replace(/[\u0300-\u036f]/g, ''); // elimina los acentos

  useEffect(() => {
    if (!open || !data) return;

    // Detectar texto del tipo, categoría o clase
    const tipoServicio = normalizarTexto(
      typeof data?.tipoServicio === 'string'
        ? data?.tipoServicio
        : data?.tipoServicio?.nombreTipoServicio || ''
    );

    const categoriaServicio = normalizarTexto(
      typeof data?.categoriaServicio === 'string'
        ? data?.categoriaServicio
        : data?.categoriaServicio?.nombre || ''
    );

    const claseServicio = normalizarTexto(
      typeof data?.claseServicio === 'string'
        ? data?.claseServicio
        : data?.claseServicio?.nombreClaseServicio || ''
    );

    // Escoge el primer valor válido (tipo > categoría > clase)
    const textoReferencia =
      tipoServicio || categoriaServicio || claseServicio || '';

    // Palabras clave para escenarios
    const tiposEscenario = [
      'cancha',
      'habitacion',
      'hotel',
      'apartamento',
      'salon',
      'casa',
    ];

    // Detectar si pertenece a escenario
    const esEscenario = tiposEscenario.some((t) =>
      textoReferencia.includes(t)
    );

    // Resetear estados según tipo
    setEsTipoEscenario(esEscenario);
    setEscenariosSeleccionados([]);
    setPrestadoresSeleccionados([]);

    // Cargar según tipo
    if (esEscenario) {
      fetchEscenarios();
    } else {
      fetchPrestadores();
    }
  }, [open, data?.tipoServicio, data?.categoriaServicio, data?.claseServicio]);

  const handleSave = async () => {
    if (esTipoEscenario && escenariosSeleccionados.length === 0) {
      enqueueSnackbar('Debes seleccionar al menos un escenario', { variant: 'warning' });
      return;
    }

    if (!esTipoEscenario && prestadoresSeleccionados.length === 0) {
      enqueueSnackbar('Debes seleccionar al menos un prestador', { variant: 'warning' });
      return;
    }

    try {
      await axios.post(`/asignar_servicio_escenario`, {
        servicio_id: data?.id,
        escenarios_id: esTipoEscenario ? escenariosSeleccionados.map((e) => e.value) : [],
        prestadores_id: !esTipoEscenario ? prestadoresSeleccionados.map((p) => p.value) : [],
      });

      enqueueSnackbar('Asignación realizada correctamente', { variant: 'success' });
      onSave();
      onClose();

    } catch (error) {
      enqueueSnackbar('Error al asignar', { variant: 'error' });
    }
  };

  // Opciones formateadas
  const escenarioOptions: OptionType[] = escenarios.map((e) => ({
    value: e.id,
    label: e.nombre,
  }));

  const prestadorOptions: OptionType[] = prestadores.map((p) => ({
    value: p.id,
    label: p.nombreCompleto,
  }));

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>Asignación de Escenarios y Prestadores</ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="grid gap-3 px-0 py-5">

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Servicio:
            </label>
            <input
              type="text"
              value={data?.nombre || ''}
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100"
            />
          </div>

          {/* 👇 Mostrar según tipo */}
          {esTipoEscenario ? (
            <div>
              <label className="block mb-1 text-sm font-medium">Escenarios:</label>
              <Select<OptionType, true>
                isMulti
                options={escenarioOptions}
                value={escenariosSeleccionados}
                onChange={(selected: MultiValue<OptionType>) =>
                  setEscenariosSeleccionados(selected as OptionType[])
                }
                placeholder="Selecciona uno o varios escenarios..."
                className="text-sm"
                classNamePrefix="react-select"
              />
            </div>
          ) : (
            <div>
              <label className="block mb-1 text-sm font-medium">Prestadores:</label>
              <Select<OptionType, true>
                isMulti
                options={prestadorOptions}
                value={prestadoresSeleccionados}
                onChange={(selected: MultiValue<OptionType>) =>
                  setPrestadoresSeleccionados(selected as OptionType[])
                }
                placeholder="Selecciona uno o varios prestadores..."
                className="text-sm"
                classNamePrefix="react-select"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="btn btn-sm btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} className="btn btn-sm btn-primary">
              Aceptar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalConfigServicio };
