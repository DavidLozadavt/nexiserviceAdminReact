import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useSnackbar } from 'notistack';

interface ModalProps {
  open: boolean;
  data?: any;
  onClose: () => void;
  onSave?: () => void;
}

const ModalServicio = ({ open, data, onClose, onSave }: ModalProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errors, setErrors] = useState({ nombre: '', precio: '', descripcion: '' });

  useEffect(() => {
    if (open) {
      if (data) {
        setNombre(data.nombreServicio || '');
        setPrecio(data.precio || '');
        setDescripcion(data.descripcion || '');
      } else {
        setNombre('');
        setPrecio('');
        setDescripcion('');
      }
      setErrors({ nombre: '', precio: '', descripcion: '' });
    }
  }, [open, data]);

  const validate = () => {
    const newErrors = {
      nombre: nombre.trim() ? '' : 'El nombre es requerido.',
      precio: precio.trim() ? '' : 'El precio es requerido.',
      descripcion: descripcion.trim() ? '' : 'La descripción es requerida.'
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append('nombreServicio', nombre);
    formData.append('precio', precio);
    formData.append('descripcion', descripcion);

    try {
      if (data) {
        await axios.post(`servicios/${data.id}`, formData);
        enqueueSnackbar('Servicio actualizado con éxito.', { variant: 'success' });
      } else {
        await axios.post('servicios', formData);
        enqueueSnackbar('Servicio creado con éxito.', { variant: 'success' });
      }
      if (onSave) onSave();
      onClose();
    } catch {
      enqueueSnackbar('Error al guardar el servicio.', { variant: 'error' });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>
            <KeenIcon icon="setting-2" className="mr-2" />
            {data ? 'Editar Servicio' : 'Nuevo Servicio'}
          </ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="grid gap-3 px-0 py-5">
          <div>
            <label className="block mb-1 text-sm font-medium">Nombre</label>
            <input
              type="text"
              className="input border rounded-md w-full p-2"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Precio</label>
            <input
              type="number"
              className="input border rounded-md w-full p-2"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Descripción</label>
            <textarea
              rows={4}
              className="textarea border rounded-md w-full p-2"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalServicio };
