import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useSnackbar } from 'notistack';

interface ProductoInterface {
  id: number;
  nombreProducto: string;
  valorCompra: number;
  valorVenta: number;
  porcentajeUtilidad: number;
  cantidad?: number;
  estado: 'PUBLICO' | 'PRIVADO';
  imagen?: string;
}

interface ModalEditarProductoProps {
  open: boolean;
  producto?: ProductoInterface;
  onClose: () => void;
  onSave: (data: ProductoInterface, file?: File) => Promise<void>;
}

const ModalEditarProducto = ({ open, producto, onClose, onSave }: ModalEditarProductoProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState<ProductoInterface>({
    id: 0,
    nombreProducto: '',
    valorCompra: 0,
    valorVenta: 0,
    porcentajeUtilidad: 0,
    cantidad: 0,
    estado: 'PUBLICO',
    imagen: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Inicializar formulario al abrir modal
  useEffect(() => {
    if (producto && open) {
      console.log('Producto recibido en modal:', producto);
      setForm({
        ...producto,
        cantidad: 0,
        imagen: producto.imagen || ''
      });
      setPreviewImageUrl(producto.imagen || null);
      setSelectedFile(null);
      setErrors({});
    }
  }, [producto, open]);

  // Validación simple
  const validate = () => {
    const newErrors: any = {};
    if (!form.nombreProducto.trim()) newErrors.nombreProducto = 'El nombre es obligatorio';
    if (form.valorCompra <= 0) newErrors.valorCompra = 'Ingrese un valor de compra válido';
    if (form.valorVenta <= 0) newErrors.valorVenta = 'Ingrese un valor de venta válido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de cambios
  const handleChange = (field: keyof ProductoInterface, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Cálculos automáticos
      if (field === 'valorCompra' || field === 'porcentajeUtilidad') {
        updated.valorVenta = Number(
          (updated.valorCompra + (updated.valorCompra * updated.porcentajeUtilidad) / 100).toFixed(
            2
          )
        );
      }

      if (field === 'valorVenta') {
        if (updated.valorCompra > 0) {
          updated.porcentajeUtilidad = Number(
            (((updated.valorVenta - updated.valorCompra) / updated.valorCompra) * 100).toFixed(2)
          );
        }
      }

      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => setPreviewImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    // Sumamos la cantidad ingresada a la actual
    const productoFinal: ProductoInterface = {
      ...form,
      cantidad: (producto?.cantidad || 0) + (form.cantidad || 0)
    };

    console.log('Producto final a enviar:', productoFinal, selectedFile);

    try {
      await onSave(productoFinal, selectedFile || undefined);
      enqueueSnackbar('Producto actualizado correctamente', { variant: 'success' });
      // Cerrar modal solo si todo salió bien
      onClose();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      enqueueSnackbar('Error al actualizar producto', { variant: 'error' });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[700px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>{`Editar producto: ${producto?.nombreProducto || ''}`}</ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="grid gap-3 px-0 py-5">
          {/* Nombre */}
          <div>
            <label className="block mb-1 text-sm font-medium">Nombre del Producto</label>
            <input
              type="text"
              className={`input p-2 border ${errors.nombreProducto ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={form.nombreProducto}
              onChange={(e) => handleChange('nombreProducto', e.target.value)}
            />
            {errors.nombreProducto && (
              <p className="text-red-500 text-sm mt-1">{errors.nombreProducto}</p>
            )}
          </div>

          {/* Valor Compra */}
          <div>
            <label className="block mb-1 text-sm font-medium">Valor Compra</label>
            <input
              type="number"
              className={`input p-2 border ${errors.valorCompra ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={form.valorCompra}
              onChange={(e) => handleChange('valorCompra', Number(e.target.value))}
            />
            {errors.valorCompra && (
              <p className="text-red-500 text-sm mt-1">{errors.valorCompra}</p>
            )}
          </div>

          {/* Porcentaje Utilidad */}
          <div>
            <label className="block mb-1 text-sm font-medium">Porcentaje de Utilidad</label>
            <input
              type="number"
              className="input p-2 border border-gray-300 rounded-md w-full"
              value={form.porcentajeUtilidad}
              onChange={(e) => handleChange('porcentajeUtilidad', Number(e.target.value))}
            />
          </div>

          {/* Valor Venta */}
          <div>
            <label className="block mb-1 text-sm font-medium">Valor Venta</label>
            <input
              type="number"
              className={`input p-2 border ${errors.valorVenta ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={form.valorVenta}
              onChange={(e) => handleChange('valorVenta', Number(e.target.value))}
            />
            {errors.valorVenta && <p className="text-red-500 text-sm mt-1">{errors.valorVenta}</p>}
          </div>

          {/* Cantidad a sumar */}
          <div>
            <label className="block mb-1 text-sm font-medium">Cantidad a Sumar</label>
            <input
              type="number"
              className="input p-2 border border-gray-300 rounded-md w-full"
              value={form.cantidad}
              onChange={(e) => handleChange('cantidad', Number(e.target.value))}
            />
          </div>

          {/* Cantidad actual */}
          <div>
            <label className="block mb-1 text-sm font-medium">Cantidad Actual</label>
            <input
              type="text"
              className="input p-2 border border-gray-300 rounded-md w-full"
              value={producto?.cantidad || 0}
              disabled
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block mb-1 text-sm font-medium">Estado</label>
            <select
              className="input p-2 border border-gray-300 rounded-md w-full"
              value={form.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
            >
              <option value="PUBLICO">PÚBLICO</option>
              <option value="PRIVADO">PRIVADO</option>
            </select>
          </div>

          {/* Imagen */}
          <div>
            <label className="block mb-1 text-sm font-medium">Imagen del producto</label>
            <input type="file" onChange={handleFileChange} />
            {previewImageUrl && <img src={previewImageUrl} className="mt-2 max-h-40" />}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-4 px-4">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              Aceptar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalEditarProducto;
