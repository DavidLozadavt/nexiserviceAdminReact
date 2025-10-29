import React, { useEffect, useState } from 'react';
import { ProcesoInterface } from './model/ProcesoInterface';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components/keenicons';
import { useSnackbar } from 'notistack';

interface ModalProps {
  open: boolean;
  process?: ProcesoInterface;
  onClose: () => void;
  onSave?: (saved?: any) => void;
}

const ModalProceso = ({ open, process, onClose, onSave }: ModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [nombreProceso, setNombreProceso] = useState(process?.nombreProceso || '');
  const [descripcion, setDescripcionProceso] = useState(process?.descripcion || '');
  const [errors, setErrors] = useState<{
    nombre: string;
    descripcion: string;
  }>({
    nombre: '',
    descripcion: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (process) {
      setNombreProceso(process.nombreProceso || '');
      setDescripcionProceso(process.descripcion || '');
    } else {
      setNombreProceso('');
      setDescripcionProceso('');
    }
  }, [process, open]);

  const validate = () => {
    const newErrors = { nombre: '', descripcion: '' };
    if (!nombreProceso || !nombreProceso.trim())
      newErrors.nombre = 'El nombre del proceso es requerido.';
    if (!descripcion || !descripcion.trim()) newErrors.descripcion = 'La descripción es requerida.';
    setErrors(newErrors);
    return Object.values(newErrors).every((v) => !v);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let resp;
      const payload = { nombreProceso: nombreProceso.trim(), descripcion: descripcion.trim() };
      if (process && process.id) {
        resp = await axios.put(`procesos/${process.id}`, payload);
      } else {
        resp = await axios.post('procesos', payload);
      }

      const saved = resp.data;
      // normalizar id si backend devuelve otro nombre
      if (saved && !saved.id && (saved.idProceso || saved.id_proceso)) {
        (saved as any).id = saved.idProceso || saved.id_proceso;
      }

      enqueueSnackbar(process ? 'Proceso actualizado' : 'Proceso creado', { variant: 'success' });

      // avisar al padre con el objeto guardado (si aplica)
      if (onSave) onSave(saved);

      // limpiar y cerrar
      setNombreProceso('');
      setDescripcionProceso('');
      onClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error al guardar proceso', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setNombreProceso('');
    setDescripcionProceso('');
    setErrors({ nombre: '', descripcion: '' });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>{process ? 'Editar Proceso' : 'Nuevo Proceso'}</ModalTitle>
          <button
            className="btn btn-sm btn-icon btn-light btn-clear shrink-0"
            onClick={handleClose}
          >
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="grid gap-3 px-0 py-5">
          <div>
            <label className="block mb-1 text-sm font-medium">Nombre Proceso</label>
            <input
              className={`input p-2 border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Nombre Proceso"
              type="text"
              value={nombreProceso}
              onChange={(e) => {
                setNombreProceso(e.target.value);
                if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: '' }));
              }}
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Descripción</label>
            <textarea
              className={`textarea p-2 border ${errors.descripcion ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => {
                setDescripcionProceso(e.target.value);
                if (errors.descripcion) setErrors((prev) => ({ ...prev, descripcion: '' }));
              }}
              rows={4}
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-500">{errors.descripcion}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 px-4 mt-4">
            <button className="btn btn-secondary" onClick={handleClose}>
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`btn btn-primary ${saving ? 'opacity-60' : ''}`}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalProceso;
