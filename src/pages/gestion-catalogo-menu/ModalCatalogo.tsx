import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { KeenIcon } from '@/components/keenicons';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { useSnackbar } from 'notistack';

interface ModalProductoProps {
  open: boolean;
  producto?: any;
  onClose: () => void;
  onSave?: () => void;
}

const ModalProducto = ({ open, producto, onClose, onSave }: ModalProductoProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [medida, setMedida] = useState('');
  const [valorVenta, setValorVenta] = useState('');
  const [estado, setEstado] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  const [categorias, setCategorias] = useState<any[]>([]);
  const [medidas, setMedidas] = useState<any[]>([]);
  const estados = ['DISPONIBLE', 'NO DISPONIBLE'];
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (open) {
      fetchCategorias();
      fetchMedidas();

      if (producto) {
        setNombre(producto.caracteristicas || '');
        setCategoria(producto.idCategoria?.toString() || '');
        setMedida(producto.idMedida?.toString() || '');
        // ✅ Formatear valorVenta cuando se abre el modal para editar
        const valor = producto.ultimoHistorialPrecio?.ValorVenta;
        setValorVenta(valor ? `$ ${parseInt(valor).toLocaleString('es-CO')}` : '');
        setEstado(producto.estado || '');
        setImagen(null);
        setPreview(producto.rutaProductoUrl || producto.urlProducto || '');
      } else {
        limpiarFormulario();
      }

      setErrors({});
    }
  }, [open, producto]);

  const fetchCategorias = async () => {
    try {
      const res = await axios.get('/get_all_categories');
      setCategorias(res.data || []);
    } catch {
      enqueueSnackbar('Error al cargar categorías', { variant: 'error' });
    }
  };

  const fetchMedidas = async () => {
    try {
      const res = await axios.get('/medidas');
      setMedidas(res.data || []);
    } catch {
      enqueueSnackbar('Error al cargar medidas', { variant: 'error' });
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setCategoria('');
    setMedida('');
    setValorVenta('');
    setEstado('');
    setImagen(null);
    setPreview('');
    setErrors({});
  };

  const validar = () => {
    const e: any = {};
    if (!nombre.trim()) e.nombreProducto = 'El nombre es obligatorio';
    if (!categoria) e.categoria = 'Seleccione una categoría';
    if (!medida) e.medida = 'Seleccione una medida';
    if (!producto?.id && !imagen) e.file = 'La imagen es obligatoria';
    if (!valorVenta.trim()) e.valorVenta = 'Ingrese un valor de venta válido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validar()) return;

    const formData = new FormData();
    formData.append('nombreProducto', nombre);
    formData.append('categoria', categoria);
    formData.append('medida', medida);

    // ✅ Limpia el formato para enviar solo números
    const valorLimpio = valorVenta.toString().replace(/[^\d.-]/g, '');
    formData.append('valorVenta', valorLimpio);

    formData.append('estado', estado);
    if (imagen) formData.append('file', imagen);

    try {
      if (producto?.id) {
        await axios.post(`/actualizar_producto_menu/${producto.id}`, formData);
        enqueueSnackbar('Producto actualizado correctamente', { variant: 'success' });
      } else {
        await axios.post(`/store_producto_menu`, formData);
        enqueueSnackbar('Producto creado correctamente', { variant: 'success' });
      }

      if (onSave) onSave();
      onClose();
    } catch {
      enqueueSnackbar('Error al guardar el producto', { variant: 'error' });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>
            <KeenIcon icon="box" className="mr-2" />
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium">Nombre del producto</label>
            <textarea
              className={`input p-2 border rounded-md w-full ${errors.nombreProducto ? 'border-red-500' : 'border-gray-300'}`}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingrese el nombre del producto"
            />
            {errors.nombreProducto && (
              <p className="mt-1 text-sm text-red-500">{errors.nombreProducto}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block mb-1 text-sm font-medium">Categoría</label>
            <select
              className={`input p-2 border rounded-md w-full ${errors.categoria ? 'border-red-500' : 'border-gray-300'}`}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            {errors.categoria && <p className="mt-1 text-sm text-red-500">{errors.categoria}</p>}
          </div>

          {/* Medida */}
          <div>
            <label className="block mb-1 text-sm font-medium">Medida (Opcional)</label>
            <select
              className="input p-2 border border-gray-300 rounded-md w-full"
              value={medida}
              onChange={(e) => setMedida(e.target.value)}
            >
              <option value="">Seleccione una medida</option>
              {medidas.map((m) => (
                <option key={m.id} value={m.id}>{`${m.valor} ${m.unidadMedida}`}</option>
              ))}
            </select>
          </div>

          {/* ✅ Valor Venta con formato en tiempo real */}
          <div>
            <label className="block mb-1 text-sm font-medium">Valor Venta</label>
            <input
              type="text"
              className={`input p-2 rounded-md w-full border ${errors.valorVenta ? 'border-red-500' : 'border-gray-300'}`}
              value={valorVenta}
              onChange={(e) => {
                let valor = e.target.value.replace(/\D/g, '');
                if (valor) {
                  valor = parseInt(valor, 10).toLocaleString('es-CO');
                  setValorVenta(`$ ${valor}`);
                } else {
                  setValorVenta('');
                }
              }}
              placeholder="$ 0"
            />
            {errors.valorVenta && <p className="mt-1 text-sm text-red-500">{errors.valorVenta}</p>}
          </div>

          {/* Estado */}
          <div>
            <label className="block mb-1 text-sm font-medium">Estado</label>
            <select
              className="input p-2 border border-gray-300 rounded-md w-full"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              {estados.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
          </div>

          {/* Imagen */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium">Imagen</label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImagen(file);
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
            {preview && (
              <img
                src={preview}
                alt="Vista previa"
                className="w-40 h-32 object-cover mt-2 rounded-md border border-gray-300 shadow-sm"
              />
            )}
            {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
          </div>

          {/* Botones */}
          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleSave}
            >
              Guardar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalProducto;
