import { useEffect, useMemo, useState } from 'react';
import { DataGrid, KeenIcon } from '@/components';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { useConfirm } from '@/hooks';
import { ModalAlmacen } from './ModalAlmacen';



interface ContentProps {
  reload: boolean;
}
// =================================================================

const GestionAlmacenContent = ({ reload }: ContentProps) => {
  const storageFilterId = 'almacen-filter';
  const [GestionAlmacen, setGestionAlmacen] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [almacen, setAlmacen] = useState<any | undefined>(undefined);
  const { confirmAction } = useConfirm();
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || '';
  });

  // Persistencia del término de búsqueda
  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  // Función renombrada y URL corregida
  const fetchAlmacenes = async () => {
    setLoading(true);
    setError('');
    try {
      // Corregir la URL de la API: de 'almacen' a 'almacenes' o tu endpoint correcto
      const response = await axios.get('almacenes');
      setGestionAlmacen(response.data);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) ? err.message : 'Error desconocido.';
      setError(`Error al cargar los almacenes: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Función renombrada y manejo de errores mejorado
  const deleteAlmacen = async (id: number) => {
    confirmAction('Esta acción eliminará este Almacén de forma permanente.', async () => {
      try {
        await axios.delete(`almacenes/${id}`);
        fetchAlmacenes();
      } catch (err) {
        const errorMessage = axios.isAxiosError(err) ? err.message : 'Error desconocido.';
        setError(`Error al eliminar el almacén: ${errorMessage}`);
      }
    });
  };

  useEffect(() => {
    fetchAlmacenes();
  }, [reload]);

  const handleAfterSave = () => {
    fetchAlmacenes();
    setIsModalOpen(false);
    setAlmacen(undefined); // Limpiar el estado del almacén después de guardar
  };

  // Función para abrir el modal para crear un nuevo almacén
  const handleAddAlmacen = () => {
    setAlmacen(undefined); // Asegura que el modal esté vacío (creación)
    setIsModalOpen(true);
  };

  // Definición de columnas con tipado correcto (Almacen)
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.nombreAlmacen,
        id: 'nombreAlmacen',
        header: () => 'Nombre Almacen',
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700 font-medium">{info.row.original.nombreAlmacen}</span>
        ),
        meta: {
          className: 'min-w-[150px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.direccion,
        id: 'direccion',
        header: () => 'Dirección',
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{info.row.original.direccion ?? 'N/A'}</span>
        ),
        meta: {
          className: 'min-w-[150px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.descripcion,
        id: 'descripcion',
        header: () => 'Descripción',
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{info.row.original.descripcion ?? 'N/A'}</span>
        ),
        meta: {
          className: 'min-w-[250px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        // Accedemos a la propiedad 'nombre' de la sede, asumiendo que es un objeto
        accessorFn: (row) => row?.nombreSede,
        id: 'sede',
        header: () => 'Sede',
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{info.row.original?.nombreSede ?? 'N/A'}</span>
        ),
        meta: {
          className: 'min-w-[150px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      // Columna de Editar
      {
        id: 'edit',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            title="Editar"
            onClick={() => {
              setIsModalOpen(true);
              setAlmacen(row.original);
            }}
          >
            <KeenIcon icon="notepad-edit" />
          </button>
        ),
        meta: { className: 'w-[60px]' }
      },
      // Columna de Eliminar
      {
        id: 'delete',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            title="Eliminar"
            onClick={() => {
              deleteAlmacen(row.original.id); // Llamada a la función renombrada
            }}
          >
            <KeenIcon icon="trash" />
          </button>
        ),
        meta: { className: 'w-[60px]' }
      }
    ],
    []
  );

  // Lógica de Filtrado
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return GestionAlmacen;

    return GestionAlmacen.filter(
      (almacen) =>
        almacen.nombre.toLowerCase().includes(term) ||
        almacen.direccion?.toLowerCase().includes(term) ||
        almacen.descripcion?.toLowerCase().includes(term) ||
        // Buscar por el nombre de la sede
        almacen.sede?.nombre?.toLowerCase().includes(term)
    );
  }, [searchTerm, GestionAlmacen]);

  // Renderizado condicional
  if (loading) {
    return <div className="p-4 text-center">Cargando almacenes...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-w-full card card-grid">
      <div className="flex-wrap py-5 card-header">
        <h3 className="card-title">Gestión de Almacenes</h3>
        <div className="flex gap-6">
          {/* Campo de Búsqueda */}
          <div className="relative">
            <KeenIcon
              icon="magnifier"
              className="absolute left-0 ml-3 leading-none text-gray-500 -translate-y-1/2 text-md top-1/2"
            />
            <input
              type="text"
              placeholder="Buscar Almacenes"
              className="pl-8 input input-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="card-body">
        {GestionAlmacen.length === 0 && !searchTerm ? (
          <div className="p-8 text-center text-gray-500">
            No hay almacenes registrados. Usa el botón "Agregar Almacén" para comenzar.
          </div>
        ) : (
          <DataGrid
            columns={columns}
            data={filteredData}
            pagination={{ size: 10 }}
          />
        )}
      </div>

      <ModalAlmacen
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAlmacen(undefined); // Asegura que se limpia el estado al cerrar
        }}
        data={almacen}
        onSave={handleAfterSave}
      />
    </div>
  );
};

export { GestionAlmacenContent };
