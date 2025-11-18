import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useSnackbar } from 'notistack';

import { ModalClaseServicio } from './ModalClaseServicio';
import { ModalTipoServicio } from './ModalTipoServicio';
import { ModalCategoriaServicio } from './ModalCategoriaServicio';

interface ModalProps {
  open: boolean;
  data?: any;
  onClose: () => void;
  onSave?: () => void;
}

const ModalServicio = ({ open, data, onClose, onSave }: ModalProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const [nombre, setNombre] = useState('');
  const [valor, setValor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tiempoServicio, setTiempoServicio] = useState('');
  const [claseServicioId, setClaseServicioId] = useState('');
  const [tipoServicioId, setTipoServicioId] = useState('');
  const [categoriaServicioId, setCategoriaServicioId] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  const [tipos, setTipos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [clases, setClases] = useState<any[]>([]);

  const [errors, setErrors] = useState({
    nombre: '',
    valor: '',
    descripcion: '',
    tipo: '',
    categoria: '',
    tiempo: '',
    clases: ''
  });

  // Modales hijos
  const [isClaseModalOpen, setIsClaseModalOpen] = useState(false);
  const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);

  // Cargar clases, tipos y categorías desde backend
  const fetchClases = async () => {
    try {
      const res = await axios.get('/clase_servicios');
      setClases(res.data);
    } catch {
      enqueueSnackbar('Error al cargar las clases de servicio', { variant: 'error' });
    }
  };

  const fetchTipos = async () => {
    try {
      const res = await axios.get('/tipo_servicios');
      setTipos(res.data);
    } catch {
      enqueueSnackbar('Error al cargar tipos de servicio', { variant: 'error' });
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await axios.get('/category_services');
      setCategorias(res.data);
    } catch {
      enqueueSnackbar('Error al cargar categorias de servicio', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (open) {
      fetchClases();
      fetchTipos();
      fetchCategorias();

      if (data) {
        setNombre(data.nombreServicio || '');
        setValor(
          data.valorServicio
            ? Number(data.valorServicio).toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
              })
            : ''
        );
        setDescripcion(data.descripcion || '');
        setTiempoServicio(data.tiempoServicio || '');
        setClaseServicioId(data.idClaseServicio || '');
        setTipoServicioId(data.idTipoServicio || '');
        setCategoriaServicioId(data.idCategoriaServicio || '');
        setPreview(data.rutaServicioUrl || '');
        setImagen(null);
      } else {
        setNombre('');
        setValor('');
        setDescripcion('');
        setTiempoServicio('');
        setClaseServicioId('');
        setTipoServicioId('');
        setCategoriaServicioId('');
        setPreview('');
        setImagen(null);
      }

      setErrors({
        nombre: '',
        valor: '',
        descripcion: '',
        clases: '',
        tipo: '',
        categoria: '',
        tiempo: ''
      });
    }
  }, [open, data]);

  const validate = () => {
    const newErrors = {
      nombre: nombre.trim() ? '' : 'El nombre es requerido.',
      valor: valor.trim() ? '' : 'El valor es requerido.',
      descripcion: descripcion.trim() ? '' : 'La descripción es requerida.',
      clases: claseServicioId ? '' : 'Selecciona una clase de servicio.',
      tipo: tipoServicioId ? '' : 'Selecciona un tipo de servicio.',
      categoria: categoriaServicioId ? '' : 'Selecciona una categoría.',
      tiempo: tiempoServicio ? '' : 'El tiempo aproximado es requerido.'
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limpio = e.target.value.replace(/\D/g, '');
    if (!limpio) return setValor('');
    const numero = parseInt(limpio);
    setValor(
      numero.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      })
    );
  };

  const handleSave = async () => {
    if (!validate()) return;

    const valorLimpio = valor.replace(/\D/g, '');

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('valor', valorLimpio);
    formData.append('descripcion', descripcion);
    formData.append('tiempoServicio', tiempoServicio); // si existe columna
    formData.append('idTipoServicio', String(tipoServicioId));
    formData.append('idCategoriaServicio', String(categoriaServicioId));
    if (imagen) formData.append('imagen', imagen);

    try {
      if (data?.id) {
        formData.append('_method', 'PUT');
        await axios.post(`/servicios/${data.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Servicio actualizado con éxito.', { variant: 'success' });
      } else {
        await axios.post('/servicios', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Servicio creado con éxito.', { variant: 'success' });
      }

      if (onSave) onSave();
      onClose();
    } catch {
      enqueueSnackbar('Error al guardar el servicio.', { variant: 'error' });
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalContent className="max-w-[600px] top-[10%] p-4">
          <ModalHeader>
            <ModalTitle>{data ? 'Editar Servicio' : 'Nuevo Servicio'}</ModalTitle>
            <button className="btn btn-sm btn-icon btn-light btn-clear" onClick={onClose}>
              <KeenIcon icon="cross" />
            </button>
          </ModalHeader>

          <ModalBody className="grid gap-3 px-0 py-5">
            <div>
              <label className="block mb-1 text-sm font-medium">Nombre del Servicio</label>
              <input
                type="text"
                className="input border rounded-md w-full p-2"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Valor</label>
              <input
                type="text"
                className="input border rounded-md w-full p-2"
                value={valor}
                onChange={handleValorChange}
              />
              {errors.valor && <p className="text-red-500 text-xs">{errors.valor}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Descripción</label>
              <textarea
                rows={2}
                className="textarea border rounded-md w-full p-2"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
              {errors.descripcion && <p className="text-red-500 text-xs">{errors.descripcion}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Tiempo aproximado (min)</label>
              <input
                type="number"
                className="input border rounded-md w-full p-2"
                value={tiempoServicio}
                onChange={(e) => setTiempoServicio(e.target.value)}
              />
              {errors.tiempo && <p className="text-red-500 text-xs">{errors.tiempo}</p>}
            </div>

            {/* Clase, Tipo y Categoría de Servicio */}
            {[
              {
                label: 'Clase',
                value: claseServicioId,
                set: setClaseServicioId,
                data: clases,
                errors: errors.clases,
                modal: setIsClaseModalOpen
              },
              {
                label: 'Tipo',
                value: tipoServicioId,
                set: setTipoServicioId,
                data: tipos,
                errors: errors.tipo,
                modal: setIsTipoModalOpen
              },
              {
                label: 'Categoría',
                value: categoriaServicioId,
                set: setCategoriaServicioId,
                data: categorias,
                errors: errors.categoria,
                modal: setIsCategoriaModalOpen
              }
            ].map((field, i) => (
              <div className="flex items-center gap-2" key={i}>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    {field.label} de Servicio
                  </label>
                  <select
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    className="input border rounded-md w-full p-2"
                  >
                    <option value="">Selecciona {field.label.toLowerCase()}</option>
                    {field.data.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.nombreClaseServicio || c.nombreTipoServicio || c.nombre}
                      </option>
                    ))}
                  </select>
                  {field.errors && <p className="text-red-500 text-xs">{field.errors}</p>}
                </div>
                <button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 flex items-center justify-center rounded-md mt-6"
                  onClick={() => field.modal(true)}
                >
                  +
                </button>
              </div>
            ))}

            <div>
              <label className="block mb-1 text-sm font-medium">Imagen</label>
              <input
                type="file"
                className="file-input"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImagen(file);
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
              {preview && (
                <img src={preview} alt="Preview" className="w-40 h-32 object-cover mt-2 rounded" />
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button className="btn btn-sm btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" className="btn btn-sm btn-primary" onClick={handleSave}>
                Guardar
              </button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modales hijos */}
      <ModalClaseServicio
        open={isClaseModalOpen}
        onClose={() => setIsClaseModalOpen(false)}
        onSave={() => {
          fetchClases();
          setIsClaseModalOpen(false);
        }}
      />
      <ModalTipoServicio
        open={isTipoModalOpen}
        clases={clases}
        onClose={() => setIsTipoModalOpen(false)}
        onSave={() => {
          fetchTipos();
          setIsTipoModalOpen(false);
        }}
      />
      <ModalCategoriaServicio
        open={isCategoriaModalOpen}
        onClose={() => setIsCategoriaModalOpen(false)}
        onSave={() => {
          fetchCategorias();
          setIsCategoriaModalOpen(false);
        }}
      />
    </>
  );
};

export { ModalServicio }; 