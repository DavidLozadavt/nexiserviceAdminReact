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
  const [valor, setValor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tiempoServicio, setTiempoServicio] = useState('');
  const [tipoServicioId, setTipoServicioId] = useState('');
  const [categoriaServicioId, setCategoriaServicioId] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [tipos, setTipos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [errors, setErrors] = useState({
    nombre: '', valor: '', descripcion: '', tipo: '', categoria: '', tiempo: ''
  });

  // Cargar datos al abrir
  useEffect(() => {
    if (open) {
      if (data) {
        setNombre(data.nombre || '');
        setValor(data.valor || '');
        setDescripcion(data.descripcion || '');
        setTiempoServicio(data.tiempoServicio || '');
        setTipoServicioId(data.idTipoServicio || '');
        setCategoriaServicioId(data.idCategoriaServicio || '');
        setPreview(data.rutaServicioUrl || '');
        setImagen(null);
      } else {
        setNombre(''); setValor(''); setDescripcion(''); setTiempoServicio('');
        setTipoServicioId(''); setCategoriaServicioId(''); setPreview(''); setImagen(null);
      }
      setErrors({ nombre: '', valor: '', descripcion: '', tipo: '', categoria: '', tiempo: '' });
    }
  }, [open, data]);

  // Cargar tipos y categorias
  useEffect(() => {
    const fetchTiposYCategorias = async () => {
      try {
        // Sólo si existieran los endpoints
        // const tiposRes = await axios.get('tipos-servicio');
        // const categoriasRes = await axios.get('categorias-servicio');
        // setTipos(tiposRes.data);
        // setCategorias(categoriasRes.data);
          setTipoServicioId('7');
          setCategoriaServicioId('1');
      } catch (e) {
        console.error(e);
      }
    };
    fetchTiposYCategorias();
  }, []);

  const validate = () => {
    const newErrors = {
      nombre: nombre.trim() ? '' : 'El nombre es requerido.',
      valor: valor.trim() ? '' : 'El valor es requerido.',
      descripcion: descripcion.trim() ? '' : 'La descripción es requerida.',
      tipo: tipoServicioId ? '' : 'Selecciona un tipo de servicio.',
      categoria: categoriaServicioId ? '' : 'Selecciona una categoría.',
      tiempo: tiempoServicio ? '' : 'El tiempo aproximado es requerido.'
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === '');
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('valor', valor);
    formData.append('descripcion', descripcion);
    formData.append('tiempoServicio', tiempoServicio);
    formData.append('idTipoServicio', String(tipoServicioId));
    formData.append('idCategoriaServicio', String(categoriaServicioId));

    if (imagen) formData.append('imagen', imagen);

    try {
      if (data) {
        formData.append('_method', 'PUT'); // 👈 importante para Laravel
        await axios.post(`servicios/${data.id}`, formData); // 👈 no uses axios.put
        enqueueSnackbar('Servicio actualizado con éxito.', { variant: 'success' });
      } else {
        await axios.post('servicios', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        enqueueSnackbar('Servicio creado con éxito.', { variant: 'success' });
      }

      if (onSave) onSave();
      onClose();
    } catch (error) {
      enqueueSnackbar('Error al guardar el servicio.', { variant: 'error' });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>
            {data ? 'Editar Servicio' : 'Nuevo Servicio'}
          </ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="grid gap-3 px-0 py-5">
          <div>
            <label className="block mb-1 text-sm font-medium">Nombre</label>
            <input type="text" className="input border rounded-md w-full p-2" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Valor</label>
            <input type="number" className="input border rounded-md w-full p-2" value={valor} onChange={(e) => setValor(e.target.value)} />
            {errors.valor && <p className="text-red-500 text-xs">{errors.valor}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Descripción</label>
            <textarea rows={4} className="textarea border rounded-md w-full p-2" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            {errors.descripcion && <p className="text-red-500 text-xs">{errors.descripcion}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Tiempo aproximado (min)</label>
            <input type="number" className="input border rounded-md w-full p-2" value={tiempoServicio} onChange={(e) => setTiempoServicio(e.target.value)} />
            {errors.tiempo && <p className="text-red-500 text-xs">{errors.tiempo}</p>}
          </div>

          {/* Tipo de Servicio */}
          <div>
            <label className="block mb-1 text-sm font-medium">Tipo de Servicio</label>
            <select
              value={tipoServicioId}
              onChange={(e) => setTipoServicioId(e.target.value)}
              className="input border rounded-md w-full p-2"
            >
              <option value="">Selecciona un tipo</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombreTipoServicio}
                </option>
              ))}
            </select>
            {errors.tipo && (
              <p className="text-red-500 text-xs">{errors.tipo}</p>
            )}
          </div>

          {/* Categoría de Servicio */}
          <div>
            <label className="block mb-1 text-sm font-medium">Categoría de Servicio</label>
            <select
              value={categoriaServicioId}
              onChange={(e) => setCategoriaServicioId(e.target.value)}
              className="input border rounded-md w-full p-2"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombreCategoriaServicio}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <p className="text-red-500 text-xs">{errors.categoria}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Imagen</label>
            <input type="file" className='file-input' accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setImagen(file);
              if (file) setPreview(URL.createObjectURL(file));
            }} />
            {preview && <img src={preview} alt="Preview" className="w-40 h-32 object-cover mt-2 rounded" />}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button className="btn btn-sm btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type='button' className="btn btn-sm btn-primary" onClick={handleSave}>
              Guardar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalServicio };
