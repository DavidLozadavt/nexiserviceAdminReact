import React, { useEffect, useMemo, useState } from 'react';
import { ProcesoInterface } from './model/ProcesoInterface';
import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import axios from 'axios';
import { DataGrid } from '@/components';
import ModalProceso from './ModalProceso';
import { useSnackbar } from 'notistack';
import { useConfirm } from '@/hooks';

// ✅ Importar tema dinámico
import { useEmpresaThemeContext } from '../../../colores/EmpresaThemeProvider';

interface ProcesoProps {
  reload: boolean;
}

const ProcesoContent = ({ reload }: ProcesoProps) => {
  const storageFilterId = 'proceso-filter';
  const [procesos, setProcesos] = useState<ProcesoInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProceso, setSelectedProceso] = useState<ProcesoInterface | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || '';
  });

  // ✅ Usar estilos dinámicos
  const { styles } = useEmpresaThemeContext();

  const columns = useMemo<ColumnDef<ProcesoInterface>[]>(
    () => [
      {
        accessorFn: (row) => row.id,
        id: 'id',
        header: () => 'Código',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">{info.row.original.id}</span>,
        meta: { className: 'w-[100px]' }
      },
      {
        accessorFn: (row) => row.nombreProceso,
        id: 'nombrePros',
        header: () => 'Nombre Proceso',
        enableSorting: true,
        cell: (info) => (
          <Link className={`font-medium text-sm ${styles.text}`} to="#">
            {info.row.original.nombreProceso}
          </Link>
        )
      },
      {
        accessorFn: (row) => row.descripcion,
        id: 'descripcion',
        header: () => 'Descripción',
        enableSorting: true,
        cell: (info) => (
          <Link className={`font-medium text-sm ${styles.text}`} to="#">
            {info.row.original.descripcion}
          </Link>
        )
      },
      {
        id: 'edit',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className={`btn btn-sm ${styles.button}`}
            onClick={() => {
              setSelectedProceso(row.original);
              setIsModalOpen(true);
            }}
          >
            <KeenIcon icon="notepad-edit" />
          </button>
        )
      },
      {
        id: 'delete',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
            onClick={() => deleteProcess(row.original.id)}
          >
            <KeenIcon icon="trash" />
          </button>
        )
      }
    ],
    [styles]
  );

  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  const { confirmAction } = useConfirm();
  const { enqueueSnackbar } = useSnackbar();

  const fetchProcess = async () => {
    setLoading(true);
    try {
      const response = await axios.get('procesos');
      setProcesos(response.data);
    } catch (error) {
      setError('Error al cargar los procesos');
    } finally {
      setLoading(false);
    }
  };

  const deleteProcess = async (id: number) => {
    confirmAction(
      'Esta acción eliminará este proceso de forma permanente. ¿Deseas continuar?',
      async () => {
        try {
          await axios.delete(`procesos/${id}`);
          await fetchProcess();
          enqueueSnackbar('Proceso eliminado correctamente', { variant: 'success' });
        } catch (err) {
          enqueueSnackbar(`Error al eliminar el proceso: ${err}`, { variant: 'error' });
        }
      }
    );
  };

  const handleAfterSave = () => {
    fetchProcess();
    setIsModalOpen(false);
    enqueueSnackbar('Proceso guardado correctamente', { variant: 'success' });
  };

  useEffect(() => {
    fetchProcess();
  }, [reload]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return procesos;
    return procesos.filter((pros) =>
      pros.nombreProceso.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, procesos]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={`relative w-full py-6 select-none`}>
      {/* header, buscador y botón (puedes reutilizar tu estructura existente) */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-6 gap-4">
        <h2 className={`text-2xl font-bold ${styles.text}`}>Procesos</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar proceso"
              className={`pl-3 input input-sm ${styles.input}`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
          <button
            className={`px-4 py-2 rounded ${styles.primary} ${styles.primaryHover} text-white`}
            onClick={() => {
              setSelectedProceso(undefined);
              setIsModalOpen(true);
            }}
          >
            Nuevo Proceso
          </button>
        </div>
      </div>

      <div
        className={`overflow-x-auto max-w-7xl mx-auto rounded-3xl ${styles.card} ${styles.shadow} p-4`}
      >
        <DataGrid
          key={JSON.stringify(filteredData)}
          columns={columns}
          data={filteredData}
          pagination={{ size: 10 }}
        />
      </div>

      <ModalProceso
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProceso(undefined);
        }}
        process={selectedProceso}
        onSave={handleAfterSave}
      />
    </div>
  );
};

export default ProcesoContent;
