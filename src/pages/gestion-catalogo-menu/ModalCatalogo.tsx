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

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [medida, setMedida] = useState('');
  const [valorVenta, setValorVenta] = useState('');
  const [estado, setEstado] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Datos dinámicos
  const [categorias, setCategorias] = useState<any[]>([]);
  const [medidas, setMedidas] = useState<any[]>([]);
  const estados = ['DISPONIBLE', 'NO DISPONIBLE'];

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    if (open) {
      fetchCategorias();
      fetchMedidas();

      if (producto) {
        setNombre(producto.nombre || '');
        setCategoria(producto.idCategoria?.toString() || '');
        setMedida(producto.idMedida?.toString() || '');
        setValorVenta(producto.valorVenta ? formatearMoneda(producto.valorVenta) : '');
        setEstado(producto.estado || '');
        setImagen(null);
      } else {
        limpiarFormulario();
      }
      setErrors({});
    }
  }, [open, producto]);

  // 🔹 Formatear moneda COP
  const formatearMoneda = (valor: string | number) => {
    if (!valor) return '';
    const number = typeof valor === 'string' ? parseFloat(valor.replace(/[^\d]/g, '')) : valor;
    if (isNaN(number)) return '';
    return number.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  // 🔹 Manejar cambio del input formateando en tiempo real
  const handleValorVentaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (!value) {
      setValorVenta('');
      return;
    }
    const number = parseInt(value, 10);
    setValorVenta(formatearMoneda(number));
  };

  // 🔹 Cargar categorías
  const fetchCategorias = async () => {
    try {
      const res = await axios.get('/get_all_categories');
      setCategorias(res.data || []);
    } catch (err) {
      console.error('Error cargando categorías', err);
      enqueueSnackbar('Error al cargar categorías', { variant: 'error' });
    }
  };

  // 🔹 Cargar medidas
  const fetchMedidas = async () => {
    try {
      const res = await axios.get('/medidas');
      setMedidas(res.data || []);
    } catch (err) {
      console.error('Error cargando medidas', err);
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
    setErrors({});
  };

  // 🔹 Validación
  const validar = () => {
    const e: any = {};
    if (!nombre.trim()) e.nombre = 'Nombre requerido';
    if (!categoria) e.categoria = 'Seleccione una categoría válida';
    if (!valorVenta.trim()) e.valorVenta = 'Ingrese un valor válido';
    if (!estado) e.estado = 'Seleccione un estado válido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // 🔹 Guardar producto
  const handleSave = async () => {
    if (!validar()) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('idCategoria', categoria);
      if (medida) formData.append('idMedida', medida);
      // Limpia el valorVenta antes de enviarlo
      const valorVentaLimpio = valorVenta.toString().replace(/[^\d.-]/g, ''); // elimina todo excepto números, punto y signo negativo

      formData.append('valorVenta', valorVentaLimpio);
      // 👈 Se envía formateado
      formData.append('estado', estado);
      if (imagen) formData.append('imagen', imagen);

      if (producto?.id) {
        await axios.post(`/actualizar_producto_menu/${producto.id}`, formData);
        enqueueSnackbar('Producto actualizado correctamente', { variant: 'success' });
      } else {
        await axios.post(`/store_producto_menu`, formData);
        enqueueSnackbar('Producto guardado correctamente', { variant: 'success' });
      }

      if (onSave) await onSave();
      onClose();
      limpiarFormulario();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Error al guardar el producto', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    limpiarFormulario();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>
            <KeenIcon icon="box" className="mr-2" />
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </ModalTitle>
          <button
            className="btn btn-sm btn-icon btn-light btn-clear shrink-0"
            onClick={handleClose}
          >
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4 px-0 py-5">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium">Nombre del producto</label>
            <textarea
              className={`input p-2 border ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              } rounded-md w-full`}
              placeholder="Ingrese el nombre del producto"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>}
          </div>

          {/* Categoría */}
          <div>
            <label className="block mb-1 text-sm font-medium">Categoría</label>
            <select
              className={`input p-2 border ${
                errors.categoria ? 'border-red-500' : 'border-gray-300'
              } rounded-md w-full`}
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
                <option key={m.id} value={m.id}>
                  {`${m.valor} ${m.unidadMedida}`}
                </option>
              ))}
            </select>
          </div>

          {/* Valor Venta */}
          <div>
            <label className="block mb-1 text-sm font-medium">Valor Venta</label>
            <input
              type="text"
              className={`input p-2 rounded-md w-full border transition-colors ${
                valorVenta ? 'border-green-500 text-green-600' : 'border-gray-300'
              }`}
              placeholder="$0"
              value={valorVenta}
              onChange={handleValorVentaChange}
            />
            {errors.valorVenta && <p className="mt-1 text-sm text-red-500">{errors.valorVenta}</p>}
          </div>

          {/* Estado */}
          <div>
            <label className="block mb-1 text-sm font-medium">Estado</label>
            <select
              className={`input p-2 border ${
                errors.estado ? 'border-red-500' : 'border-gray-300'
              } rounded-md w-full`}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Seleccione un estado</option>
              {estados.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
            {errors.estado && <p className="mt-1 text-sm text-red-500">{errors.estado}</p>}
          </div>

          {/* Imagen */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium">Imagen del producto</label>
            <input
              type="file"
              className="input p-2 border border-gray-300 rounded-md w-full"
              onChange={(e) => setImagen(e.target.files?.[0] || null)}
            />
          </div>

          {/* Botones */}
          <div className="md:col-span-2 flex justify-end gap-3 px-4 mt-2">
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Aceptar'}
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalProducto;
