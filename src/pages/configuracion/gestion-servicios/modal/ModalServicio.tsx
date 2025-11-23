import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
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
  // Ya no necesitamos idCompany como prop si usamos la ruta /responsables
}

// Definición de la estructura de los datos del prestador
interface Prestador {
    id: number;
    nombre: string;
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

  // ESTADOS PARA PRESTADORES
  const [prestadoresDisponibles, setPrestadoresDisponibles] = useState<Prestador[]>([]);
  const [prestadoresSeleccionados, setPrestadoresSeleccionados] = useState<number[]>([]); 
  
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  const [errors, setErrors] = useState({
    nombre: '',
    valor: '',
    descripcion: '',
    tipo: '',
    categoria: '',
    tiempo: '',
    clases: '',
    prestadores: '' // Añadimos el error de prestadores
  });

  // Modales hijos
  const [isClaseModalOpen, setIsClaseModalOpen] = useState(false);
  const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);

  // 🚨 FUNCIÓN PARA CARGAR PRESTADORES (Usando la ruta funcional /responsables)
  const fetchPrestadores = async () => {
    // Usamos la ruta que se mostró funcionando en el inspector de red: /responsables
    const url = `/responsables`; 
    
    try {
      // La API debe retornar la lista de responsables que incluye el objeto 'persona'
      const res: AxiosResponse<any[]> = await axios.get(url);
      const dataRecibida = res.data;

      if (!Array.isArray(dataRecibida)) {
          console.error("[ERROR] La API de responsables no retornó una lista válida:", dataRecibida);
          return;
      }
      
      const mappedPrestadores: Prestador[] = dataRecibida.map((p: any) => {
          const persona = p.persona;
          // Lógica robusta de construcción del nombre
          const nombre1 = persona?.nombre1 || '';
          const apellido1 = persona?.apellido1 || '';
          const nombreFinal = `${nombre1} ${apellido1}`.trim() || `Prestador ID ${p.id}`;

          return {
              id: p.id,
              nombre: nombreFinal 
          };
      });

      setPrestadoresDisponibles(mappedPrestadores);

    } catch (error) {
      console.error('[ERROR] Error crítico al cargar prestadores:', error);
      enqueueSnackbar('Error al cargar la lista de prestadores.', { variant: 'error' });
    }
  };

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

  // 🔄 useEffect para cargar datos
  useEffect(() => {
    if (open) {
      fetchClases();
      fetchTipos();
      fetchCategorias();
      fetchPrestadores(); // 🚨 Cargar prestadores usando la ruta funcional

      if (data) {
        setNombre(data.nombre || '');
        setValor(
          data.valor
            ? Number(data.valor).toLocaleString('es-CO', {
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
        
        // Cargar prestadores seleccionados existentes
        if (data.responsables && Array.isArray(data.responsables)) {
            const ids = data.responsables.map((r: { id: number }) => r.id);
            setPrestadoresSeleccionados(ids);
        } else {
            setPrestadoresSeleccionados([]);
        }

      } else {
        // Reset al crear nuevo
        setNombre('');
        setValor('');
        setDescripcion('');
        setTiempoServicio('');
        setClaseServicioId('');
        setTipoServicioId('');
        setCategoriaServicioId('');
        setPreview('');
        setImagen(null);
        setPrestadoresSeleccionados([]);
      }

      setErrors({
        nombre: '',
        valor: '',
        descripcion: '',
        clases: '',
        tipo: '',
        categoria: '',
        tiempo: '',
        prestadores: ''
      });
    }
  }, [open, data]);

  // ✅ Validación
  const validate = () => {
    const newErrors = {
      nombre: nombre.trim() ? '' : 'El nombre es requerido.',
      valor: valor.trim() ? '' : 'El valor es requerido.',
      descripcion: descripcion.trim() ? '' : 'La descripción es requerida.',
      clases: claseServicioId ? '' : 'Selecciona una clase de servicio.',
      tipo: tipoServicioId ? '' : 'Selecciona un tipo de servicio.',
      categoria: categoriaServicioId ? '' : 'Selecciona una categoría.',
      tiempo: tiempoServicio ? '' : 'El tiempo aproximado es requerido.',
      prestadores: prestadoresSeleccionados.length > 0 ? '' : 'Selecciona al menos un prestador.'
    };
    setErrors(newErrors as any); 
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
    
    let tiempoFinal = tiempoServicio;
    if (unidadTiempo === 'hrs' && tiempoServicio) {
      tiempoFinal = (Number(tiempoServicio) * 60).toString();
    }
    formData.append('tiempoServicio', tiempoFinal);

    formData.append('idTipoServicio', String(tipoServicioId));
    formData.append('idCategoriaServicio', String(categoriaServicioId));
    
    // 🚨 ADICIÓN DE PRESTADORES AL FORM DATA
    prestadoresSeleccionados.forEach((id, index) => {
        formData.append(`responsables[${index}]`, String(id));
    });
    
    if (imagen) formData.append('urlImage', imagen);

    try {
      if (data?.id) {
        formData.append('_method', 'PUT');
        await axios.post(`servicios/${data.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        enqueueSnackbar('Servicio actualizado con éxito.', { variant: 'success' });
      } else {
        await axios.post('servicios', formData, {
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
      <Modal open={open}>
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
            
            {/* SELECTOR DE PRESTADORES / RESPONSABLES */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                Prestadores / Responsables
              </label>
              <select
                multiple 
                value={prestadoresSeleccionados.map(String)}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.options)
                    .filter(option => option.selected)
                    .map(option => Number(option.value)); 
                  setPrestadoresSeleccionados(selectedOptions);
                }}
                className="input border rounded-md w-full p-2 h-32" 
              >
                <option value="" disabled>
                    {prestadoresDisponibles.length > 0 
                        ? `Selecciona (${prestadoresDisponibles.length}) prestadores` 
                        : 'Cargando prestadores o lista vacía...'}
                </option>
                {prestadoresDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {errors.prestadores && <p className="text-red-500 text-xs">{errors.prestadores}</p>}
              <p className="text-xs text-gray-500 mt-1">
                  Mantén presionada la tecla **Ctrl/Cmd** para seleccionar varios responsables.
              </p>
            </div>
            {/* FIN SELECTOR DE PRESTADORES */}


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