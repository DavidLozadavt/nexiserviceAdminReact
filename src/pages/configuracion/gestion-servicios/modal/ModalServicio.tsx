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
  const [unidadTiempo, setUnidadTiempo] = useState<'min' | 'hrs'>('min');

  const [claseServicioId, setClaseServicioId] = useState('');
  const [tipoServicioId, setTipoServicioId] = useState('');
  const [categoriaServicioId, setCategoriaServicioId] = useState('');
  
  const [tipos, setTipos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [clases, setClases] = useState<any[]>([]);

  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  const [errors, setErrors] = useState({
    nombre: '', valor: '', descripcion: '', tipo: '', categoria: '', tiempo: '', clases: ''
  });

  // Estados para abrir modales hijos
  const [isClaseModalOpen, setIsClaseModalOpen] = useState(false);
  const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);

  // Cargar desde backend clases, tipos y categorías
  const fetchClases = async () => {
    try {
      const res = await axios.get('clase_servicios');
      setClases(res.data);
    } catch (error) {
      enqueueSnackbar('Error al cargar las clases de servicio', { variant: 'error' });
    }
  };

  const fetchTipos = async () => {
    try {
      const tiposRes = await axios.get('tipo_servicios');
      setTipos(tiposRes.data);
    } catch (error) {
      enqueueSnackbar('Error al cargar tipos de servicio', { variant: 'error' });
    }
  };

  const fetchCategorias = async () => {
    try {
      const categoriasRes = await axios.get('category_services');
      setCategorias(categoriasRes.data);
    } catch (error) {
      enqueueSnackbar('Error al cargar categorias de servicio', { variant: 'error' });
    }
  };

  // Cargar datos al abrir
  useEffect(() => {
    if (open) {
      fetchClases();
      fetchTipos();
      fetchCategorias();

      if (data) {
        setNombre(data.nombre || '');

        // formatear el valor
        if (data.valor) {
          const numero = Number(data.valor);
          const valorFormateado = numero.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });
          setValor(valorFormateado);
        } else {
          setValor('');
        }

        setDescripcion(data.descripcion || '');
        setTiempoServicio(data.tiempoServicio || '');
        setClaseServicioId(data.claseServicioId || '');
        setTipoServicioId(data.idTipoServicio || '');
        setCategoriaServicioId(data.idCategoriaServicio || '');
        setPreview(data.rutaServicioUrl || '');
        setImagen(null);
      } else {
        setNombre(''); setValor(''); setDescripcion(''); setTiempoServicio(''); setClaseServicioId('');
        setTipoServicioId(''); setCategoriaServicioId(''); setPreview(''); setImagen(null);
      }
      setErrors({ nombre: '', valor: '', descripcion: '', clases: '', tipo: '', categoria: '', tiempo: '' });
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

  const handleSave = async () => {
    if (!validate()) return;

    // limpiar formato de pesos y dejar número
    const valorLimpio = valor.replace(/\D/g, '');

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('valor', valorLimpio);
    formData.append('descripcion', descripcion);
    // Convertir a minutos si el usuario eligió horas
    let tiempoFinal = tiempoServicio;
    if (unidadTiempo === 'hrs' && tiempoServicio) {
      tiempoFinal = (Number(tiempoServicio) * 60).toString();
    }
    formData.append('tiempoServicio', tiempoFinal);

    // formData.append('idClaseServicio', String(claseServicioId));
    formData.append('idTipoServicio', String(tipoServicioId));
    formData.append('idCategoriaServicio', String(categoriaServicioId));

    if (imagen) formData.append('imagen', imagen);

    try {
      if (data) {
        formData.append('_method', 'PUT'); 
        await axios.post(`servicios/${data.id}`, formData); 
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

  // 👉 Manejo del input de valor con formato COP
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limpio = e.target.value.replace(/\D/g, '');
    if (!limpio) return setValor('');

    const numero = parseInt(limpio);
    const formateado = numero.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    setValor(formateado);
  };

  return (
    <>
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
              <label className="block mb-1 text-sm font-medium">Nombre del Servicio</label>
              <input
                type="text"
                className="input border rounded-md w-full p-2"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Corte de Cabello"
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
                placeholder="$0"
              />
              {errors.valor && <p className="text-red-500 text-xs">{errors.valor}</p>}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Tiempo aproximado (min/hrs)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input border rounded-md w-full p-2"
                  value={tiempoServicio}
                  onChange={(e) => setTiempoServicio(e.target.value)}
                  placeholder="Ej: 60"
                />
                <select
                  className="input border rounded-md p-2 w-10 h-10"
                  value={unidadTiempo}
                  onChange={(e) => setUnidadTiempo(e.target.value as 'min' | 'hrs')}
                >
                  <option value="min">min</option>
                  <option value="hrs">hrs</option>
                </select>
              </div>
              {errors.tiempo && <p className="text-red-500 text-xs">{errors.tiempo}</p>}
            </div>

            {/* Clase de Servicio */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">Clase de Servicio</label>
                <select
                  value={claseServicioId}
                  onChange={(e) => setClaseServicioId(e.target.value)}
                  className="input border rounded-md w-full p-2"
                >
                  <option value="">Selecciona una clase</option>
                  {clases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombreClaseServicio}
                    </option>
                  ))}
                </select>
                {errors.clases && <p className="text-red-500 text-xs">{errors.clases}</p>}
              </div>

              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 flex items-center justify-center rounded-md mt-6"
                onClick={() => setIsClaseModalOpen(true)}
              >
                +
              </button>
            </div>

            {/* Tipo de Servicio */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
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

              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 flex items-center justify-center rounded-md mt-6"
                onClick={() => setIsTipoModalOpen(true)}
              >
                +
              </button>
            </div>

            {/* Categoría de Servicio */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block mb-1 text-sm font-medium">Categoría de Servicio</label>
                <select
                  value={categoriaServicioId}
                  onChange={(e) => setCategoriaServicioId(e.target.value)}
                  className="input border rounded-md w-full p-2"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {errors.categoria && (
                  <p className="text-red-500 text-xs">{errors.categoria}</p>
                )}
              </div>
              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 flex items-center justify-center rounded-md mt-6"
                onClick={() => setIsCategoriaModalOpen(true)}
              >
                +
              </button>
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

      {/* Modales hijos */}
      <ModalClaseServicio
        open={isClaseModalOpen}
        onClose={() => setIsClaseModalOpen(false)}
        onSave={() => { fetchClases(); setIsClaseModalOpen(false); }}
      />

      <ModalTipoServicio
        open={isTipoModalOpen}
        clases={clases}
        onClose={() => setIsTipoModalOpen(false)}
        onSave={() => { fetchTipos(); setIsTipoModalOpen(false); }}
      />

      <ModalCategoriaServicio
        open={isCategoriaModalOpen}
        onClose={() => setIsCategoriaModalOpen(false)}
        onSave={() => { fetchCategorias(); setIsCategoriaModalOpen(false); }}
      />
    </>
  );
};

export { ModalServicio };
