import { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { DataGrid, KeenIcon } from '@/components';
import { ColumnDef } from '@tanstack/react-table';
import { useConfirm } from '@/hooks';
import { Container } from '@/components/container';
import ModalEditarProducto from './EditarProductos'; // Modal depurado que pasamos antes

interface ProductoInterface {
  id: number;
  rutaProductoUrl?: string;
  caracteristicas?: string;
  tipoProducto?: { nombreTipoProducto: string };
  medida?: { valor: number; unidadMedida: string };
  totalDistribuido?: number;
  cantidad?: number;
  estado?: 'PUBLICO' | 'PRIVADO';
  ultimoHistorialPrecio?: {
    valorCompra?: number;
    ValorVenta?: number;
    porcentajeUtilidad?: number;
  };
  nombreProducto?: string;
  valorCompra?: number;
  valorVenta?: number;
  porcentajeUtilidad?: number;
  imagen?: string;
}

const ConfiguracionProducto = () => {
  const [productos, setProductos] = useState<ProductoInterface[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageActual, setPageActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);
  const [numReg, setNumReg] = useState(10);
  const [loading, setLoading] = useState(true);
  const { confirmAction } = useConfirm();

  // 🔹 Estado del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [productoEditar, setProductoEditar] = useState<ProductoInterface | null>(null);

  // 🔹 Cargar productos
  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `products_by_tipo_producto?search=${encodeURIComponent(searchTerm)}&per_page=${numReg}&page=${pageActual}`
      );
      setProductos(response.data.data || response.data);
      setTotalProductos(response.data.total || response.data.length);
      setTotalPaginas(response.data.last_page || 1);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, numReg, pageActual]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // 🔹 Columnas de la tabla
  const columns = useMemo<ColumnDef<ProductoInterface>[]>(
    () => [
      {
        id: 'cantidad',
        header: () => 'Cant.',
        cell: (info) => <span>{info.row.original.totalDistribuido || 0}</span>,
        meta: { className: 'w-[80px]' }
      },
      {
        id: 'imagen',
        header: () => 'Imagen',
        cell: (info) => (
          <div className="flex justify-center">
            <img
              src={info.row.original.rutaProductoUrl || info.row.original.imagen}
              alt="Producto"
              className="w-20 h-20 object-cover rounded"
            />
          </div>
        ),
        meta: { className: 'w-[100px]' }
      },
      {
        id: 'medida',
        header: () => 'Medida',
        cell: (info) => {
          const m = info.row.original.medida;
          return <span>{m ? `${m.valor} ${m.unidadMedida}` : '-'}</span>;
        }
      },
      {
        id: 'producto',
        header: () => 'Producto',
        cell: (info) => (
          <span>{info.row.original.caracteristicas || info.row.original.nombreProducto}</span>
        )
      },
      {
        id: 'tipoProducto',
        header: () => 'Tipo Producto',
        cell: (info) => <span>{info.row.original.tipoProducto?.nombreTipoProducto || '-'}</span>
      },
      {
        id: 'valorCompra',
        header: () => 'V. Compra / U.',
        cell: (info) => (
          <span>
            {info.row.original.ultimoHistorialPrecio?.valorCompra?.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP'
            }) ||
              info.row.original.valorCompra?.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP'
              }) ||
              '—'}
          </span>
        )
      },
      {
        id: 'valorVenta',
        header: () => 'V. Venta / U.',
        cell: (info) => (
          <span>
            {info.row.original.ultimoHistorialPrecio?.ValorVenta
              ? info.row.original.ultimoHistorialPrecio?.ValorVenta.toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP'
                })
              : info.row.original.valorVenta
                ? info.row.original.valorVenta.toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP'
                  })
                : 'No configurado'}
          </span>
        )
      },
      {
        id: 'acciones',
        header: () => 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2 justify-center">
            <button
              title="Actualizar"
              className="btn btn-sm btn-icon btn-light btn-primary"
              onClick={() => handleActualizar(row.original)}
            >
              <KeenIcon icon="notepad-edit" className="text-blue-500" />
            </button>

            <button
              title="Historial de precios"
              className="btn btn-sm btn-icon btn-light btn-success"
              onClick={() => handleHistorial(row.original)}
            >
              <KeenIcon icon="chart-line" className="text-green-500" />
            </button>
          </div>
        ),
        meta: { className: 'w-[140px]' }
      }
    ],
    []
  );

  // 🔹 Handlers
  const handleActualizar = (producto: ProductoInterface) => {
    if (!producto) return;
    setProductoEditar(producto);
    setModalOpen(true);
  };

  const handleHistorial = (producto: ProductoInterface) => {
    console.log('Ver historial de precios de:', producto);
  };

  const handleGuardarProducto = async (data: ProductoInterface, file?: File) => {
    try {
      console.log('Datos recibidos del modal:', data, file);

      const formData = new FormData();
      formData.append('id', String(data.id));
      formData.append('nombreProducto', data.nombreProducto || '');
      formData.append('valorCompra', String(data.valorCompra || 0));
      formData.append('valorVenta', String(data.valorVenta || 0));
      formData.append('porcentajeUtilidad', String(data.porcentajeUtilidad || 0));
      formData.append('cantidad', String(data.cantidad || 0));
      formData.append('estado', data.estado || 'PUBLICO');

      if (file) formData.append('imagen', file);

      const response = await axios.post('update_valor_venta_producto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Respuesta backend:', response.data);

      fetchProductos();
      setModalOpen(false);
      setProductoEditar(null);
    } catch (error) {
      console.error('Error actualizando producto:', error);
    }
  };

  // 🔹 Paginación
  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPageActual(pagina);
  };

  const obtenerPaginas = () => Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <Container>
      <div className="card card-grid min-w-full">
        <div className="card-header flex-wrap py-5">
          <h3 className="card-title">Configuración de Productos</h3>
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="leading-none text-md text-gray-500 absolute top-1/2 left-0 -translate-y-1/2 ml-3"
              />
              <input
                type="text"
                placeholder="Buscar producto..."
                className="input input-sm pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageActual(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="card-body">
          <DataGrid
            key={JSON.stringify(productos)}
            columns={columns}
            data={productos}
            loading={loading}
          />
        </div>
      </div>

      {/* Modal de edición */}
      {modalOpen && productoEditar && (
        <ModalEditarProducto
          open={modalOpen}
          producto={productoEditar}
          onClose={() => {
            setModalOpen(false);
            setProductoEditar(null);
          }}
          onSave={handleGuardarProducto}
        />
      )}
    </Container>
  );
};

export default ConfiguracionProducto;
