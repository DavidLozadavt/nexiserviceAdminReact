import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components';
import { KeenIcon } from '@/components/keenicons';
import { useSnackbar } from 'notistack';
import { useConfirm } from '@/hooks';
import ModalProducto from './ModalCatalogo';

interface Props {
  reload: boolean;
}

const CatalogoProductosContent = ({ reload }: Props) => {
  const storageFilterId = 'productos-filter';
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [producto, setProducto] = useState<any | undefined>(undefined);
  const { enqueueSnackbar } = useSnackbar();
  const { confirmAction } = useConfirm();

  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || '';
  });

  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/products_catalogo_menu?search=&per_page=10&page=1');
      setProductos(res.data.data);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [reload]);

  const handleAfterSave = () => {
    fetchData(); // 🔹 Refresca la tabla al guardar
    setIsModalOpen(false);
    setProducto(undefined);
  };

  const deleteProducto = async (id: number) => {
    confirmAction('¿Seguro que deseas eliminar este producto?', async () => {
      try {
        await axios.post(`/delete_producto_menu/${id}`);
        enqueueSnackbar('Producto eliminado correctamente', { variant: 'success' });
        fetchData();
      } catch (err) {
        enqueueSnackbar('Error al eliminar el producto', { variant: 'error' });
      }
    });
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.rutaProductoUrl,
        id: 'imagen',
        header: () => 'Imagen',
        cell: (info) => (
          <div className="flex justify-center">
            <img
              src={info.row.original.rutaProductoUrl || '/default/category.png'}
              alt="Producto"
              className="w-16 h-16 object-cover rounded-md border border-gray-200"
              onError={(e) => (e.currentTarget.src = '/default/category.png')}
            />
          </div>
        ),
        meta: { className: 'w-[100px]' }
      },
      {
        accessorFn: (row) => row.nombreProducto,
        id: 'producto',
        header: () => 'Producto',
        cell: (info) => <span className="text-gray-700">{info.row.original.caracteristicas}</span>,
        meta: { className: 'min-w-[150px]' }
      },
      {
        accessorFn: (row) => row.medida,
        id: 'medida',
        header: () => 'Medida',
        cell: (info) => {
          const medida = info.row.original.medida;
          return (
            <span className="text-gray-700">
              {medida ? `${medida.valor ?? ''} ${medida.unidadMedida ?? ''}`.trim() : 'No aplica'}
            </span>
          );
        },
        meta: { className: 'min-w-[150px]' }
      },
      {
        accessorFn: (row) => row.ultimoHistorialPrecio?.ValorVenta,
        id: 'valorVenta',
        header: () => 'Valor',
        cell: (info) => (
          <span className="text-gray-700 font-semibold">
            {Number(info.row.original.ultimoHistorialPrecio?.ValorVenta).toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0
            })}
          </span>
        ),
        meta: { className: 'min-w-[120px]' }
      },
      {
        id: 'edit',
        header: () => '',
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear text-blue-600 hover:text-blue-700"
            onClick={() => {
              setProducto(row.original);
              setIsModalOpen(true);
            }}
          >
            <KeenIcon icon="notepad-edit" />
          </button>
        ),
        meta: { className: 'w-[60px]' }
      },
      {
        id: 'delete',
        header: () => '',
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear text-red-600 hover:text-red-700"
            onClick={() => deleteProducto(row.original.id)}
          >
            <KeenIcon icon="trash" />
          </button>
        ),
        meta: { className: 'w-[60px]' }
      }
    ],
    []
  );

  const filteredData = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return productos;
    return productos.filter((p) => (p.nombreProducto || '').toString().toLowerCase().includes(q));
  }, [searchTerm, productos]);

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="card card-grid min-w-full">
      <div className="card-header flex-wrap py-5">
        <h1 className="card-title">Catálogo de Productos</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <KeenIcon
              icon="magnifier"
              className="leading-none text-md text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Buscar producto"
              className="input input-sm pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card-body">
        <DataGrid
          key={JSON.stringify(filteredData)}
          columns={columns}
          data={filteredData}
          pagination={{ size: 10 }}
        />
      </div>

      <ModalProducto
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProducto(undefined);
        }}
        producto={producto}
        onSave={handleAfterSave} // 🔹 refresca la tabla
      />
    </div>
  );
};

export default CatalogoProductosContent;