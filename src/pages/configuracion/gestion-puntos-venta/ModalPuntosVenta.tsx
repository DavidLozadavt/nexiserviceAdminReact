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

const ModalPuntosVenta = ({ open, onClose, data, onSave }: ModalProps) => {
  const { enqueueSnackbar } = useSnackbar();

  // Estados de los campos
  const [nombre, setNombre] = useState('');
  const [idSede, setIdSede] = useState('');
  const [tipo, setTipo] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [sedes, setSedes] = useState<any[]>([]);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({
    nombre: '',
    idSede: '',
    imagenUrl: ''
  });

  // Cargar sedes al abrir el modal
  useEffect(() => {
    if (open) {
      fetchSedes();
      if (data) {
        setNombre(data.nombre || '');
        setIdSede(data.idSede || '');
        setImagenUrl(data.imagenUrl || '');
        setImagenFile(null);
      } else {
        setNombre('');
        setIdSede('');
        setImagenUrl('');
        setImagenFile(null);
      }
      setErrors({
        nombre: '',
        idSede: '',
        imagenUrl: ''
      });
    }
  }, [open, data]);

  const fetchSedes = async () => {
    setLoadingSedes(true);
    try {
      const response = await axios.get('sedes');
      setSedes(response.data);
    } catch (error) {
      enqueueSnackbar('No se pudieron cargar las sedes.', { variant: 'error' });
    } finally {
      setLoadingSedes(false);
    }
  };

  const validate = () => {
    const newErrors = {
      nombre: nombre.trim() ? '' : 'El nombre es requerido.',
      idSede: idSede ? '' : 'La sede es requerida.',
      imagenUrl: ''
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagenFile(e.target.files[0]);
      setImagenUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('idSede', idSede);
    if (imagenFile) {
      formData.append('imagenUrl', imagenFile);
    }

    try {
      if (data) {
        await axios.post(`punto_de_ventas/${data.id}?_method=PUT`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Punto de venta actualizado con éxito.', { variant: 'success' });
      } else {
        await axios.post('punto_de_ventas', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Punto de venta guardado con éxito.', { variant: 'success' });
      }

      if (onSave) onSave();
      onClose();
    } catch (error) {
      enqueueSnackbar('Error al guardar los datos.', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open}>
      <ModalContent className="max-w-[600px] top-[10%] p-4 relative">
        {/* 🟢 Tarjeta pequeña mientras se guarda */}
        {saving && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/20 dark:bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-black shadow-xl rounded-xl px-6 py-4 flex items-center gap-3 border border-blue-100 animate-fadeIn">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent dark:border-blue-600 dark:border-t-transparent"></div>
              <p className="text-blue-600 dark:text-blue-600 font-semibold text-base">
                Guardando punto de venta...
              </p>
            </div>
          </div>
        )}
        <ModalHeader>
          <ModalTitle>
            <KeenIcon icon="shop" className="mr-2" />
            {data ? 'Editar Punto de Venta' : 'Nuevo Punto de Venta'}
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
              className={`input p-2 border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: '' }));
              }}
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>}
          </div>

          {/* Sede */}
          <div>
            <label htmlFor="idSede" className="block mb-1 text-sm font-medium">
              Sede
            </label>
            <select
              id="idSede"
              className={`input p-2 border ${errors.idSede ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={idSede}
              onChange={(e) => {
                setIdSede(e.target.value);
                if (errors.idSede) setErrors((prev) => ({ ...prev, idSede: '' }));
              }}
            >
              <option value="">{loadingSedes ? 'Cargando sedes...' : 'Seleccione una sede'}</option>
              {sedes.map((sede: any) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombreSede || sede.nombre}
                </option>
              ))}
            </select>
            {errors.idSede && <p className="mt-1 text-sm text-red-500">{errors.idSede}</p>}
          </div>

          {/* Imagen */}
          <div className="flex flex-col">
            <label htmlFor="imagen" className="block mb-1 text-sm font-medium">
              Imagen
            </label>

            <input
              type="file"
              id="imagen"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />

            {imagenUrl && (
              <div className="mt-4 flex justify-center">
                <img
                  src={imagenUrl}
                  alt="Vista previa"
                  className="w-64 h-56 object-contain rounded-lg shadow-md"
                />
              </div>
            )}

            {errors.imagenUrl && <p className="mt-1 text-sm text-red-500">{errors.imagenUrl}</p>}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 px-4 mt-4">
            <button className="btn btn-secondary" onClick={onClose}>
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

export default ModalPuntosVenta;