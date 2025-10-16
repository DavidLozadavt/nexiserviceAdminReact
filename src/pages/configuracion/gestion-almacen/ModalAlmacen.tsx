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

const ModalAlmacen = ({ open, data, onClose, onSave }: ModalProps) => {
  const { enqueueSnackbar } = useSnackbar();

  // Estados de los campos
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [sede, setSede] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errors, setErrors] = useState({
    nombre: '',
    direccion: '',
    sede: '',
    descripcion: ''
  });

  // 🔹 Nuevo estado para las sedes
  const [sedes, setSedes] = useState<any[]>([]);
  const [loadingSedes, setLoadingSedes] = useState<boolean>(false);

  // 🔹 Obtener las sedes desde el backend
  const fetchSedes = async () => {
    setLoadingSedes(true);
    try {
      const response = await axios.get('sedes'); // 👈 Ajusta el endpoint si tu API es diferente
      setSedes(response.data);
    } catch (error) {
      console.error('Error al cargar las sedes:', error);
      enqueueSnackbar('No se pudieron cargar las sedes.', { variant: 'error' });
    } finally {
      setLoadingSedes(false);
    }
  };

  // Limpiar o setear datos al abrir el modal
  useEffect(() => {
    if (open) {
      fetchSedes(); // 👈 Cargar sedes cuando se abre el modal

      if (data) {
        setNombre(data.nombre || '');
        setDireccion(data.direccion || '');
        setSede(data.idSede || ''); // 👈 si tu backend guarda idSede
        setDescripcion(data.descripcion || '');
      } else {
        setNombre('');
        setDireccion('');
        setSede('');
        setDescripcion('');
      }
      setErrors({
        nombre: '',
        direccion: '',
        sede: '',
        descripcion: ''
      });
    }
  }, [open, data]);

  // Validación de campos
  const validate = () => {
    const newErrors = {
      nombre: nombre.trim() ? '' : 'El nombre es requerido.',
      direccion: direccion.trim() ? '' : 'La dirección es requerida.',
      sede: sede.trim() ? '' : 'La sede es requerida.',
      descripcion: descripcion.trim() ? '' : 'La descripción es requerida.'
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  // Guardar o actualizar almacén
  const handleSave = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append('nombreAlmacen', nombre);
    formData.append('direccion', direccion);
    formData.append('idSede', sede); // 👈 usamos idSede para enviar
    formData.append('descripcion', descripcion);

    try {
      if (data) {
        await axios.post(`almacenes/${data.id}`, formData);
        enqueueSnackbar('Almacén actualizado con éxito.', { variant: 'success' });
      } else {
        await axios.post('almacenes', formData);
        enqueueSnackbar('Almacén guardado con éxito.', { variant: 'success' });
      }
      if (onSave) onSave();
      onClose();
    } catch (error) {
      enqueueSnackbar('Error al guardar los datos.', { variant: 'error' });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>
            <KeenIcon icon="warehouse" className="mr-2" />
            {data ? 'Editar Almacén' : 'Nuevo Almacén'}
          </ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="grid gap-3 px-0 py-5">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block mb-1 text-sm font-medium">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              className={`input p-2 border ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              } rounded-md w-full`}
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: '' }));
              }}
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>}
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="direccion" className="block mb-1 text-sm font-medium">
              Dirección
            </label>
            <input
              id="direccion"
              type="text"
              className={`input p-2 border ${
                errors.direccion ? 'border-red-500' : 'border-gray-300'
              } rounded-md w-full`}
              value={direccion}
              onChange={(e) => {
                setDireccion(e.target.value);
                if (errors.direccion) setErrors((prev) => ({ ...prev, direccion: '' }));
              }}
            />
            {errors.direccion && <p className="mt-1 text-sm text-red-500">{errors.direccion}</p>}
          </div>

          {/* 🔹 Campo de sede dinámico */}
          <div>
            <label htmlFor="sede" className="block mb-1 text-sm font-medium">
              Sede
            </label>
            <select
              id="sede"
              className={`input p-2 border ${
                errors.sede ? 'border-red-500' : 'border-gray-300'
              } rounded-md w-full`}
              value={sede}
              onChange={(e) => {
                setSede(e.target.value);
                if (errors.sede) setErrors((prev) => ({ ...prev, sede: '' }));
              }}
            >
              <option value="">{loadingSedes ? 'Cargando sedes...' : 'Seleccione una sede'}</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombreSede}
                </option>
              ))}
            </select>
            {errors.sede && <p className="mt-1 text-sm text-red-500">{errors.sede}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block mb-1 text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="descripcion"
              className={`textarea p-2 border ${
                errors.descripcion ? 'border-red-500' : 'border-gray-300'
              } rounded-md w-full`}
              placeholder="Descripción"
              rows={4}
              value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value);
                if (errors.descripcion) setErrors((prev) => ({ ...prev, descripcion: '' }));
              }}
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-500">{errors.descripcion}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 px-4 mt-4">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Guardar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalAlmacen };
