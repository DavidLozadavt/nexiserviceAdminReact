import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { PersonalInterface } from './model/PersonalInterface';
import { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components';
import { KeenIcon } from '@/components/keenicons';
import ModalPersonal from './ModalPersonal';
import { useEmpresaThemeContext } from '../../colores/EmpresaThemeProvider';
import { useConfirm } from '@/hooks';
import { useSnackbar } from 'notistack';

interface Props {
  reload: boolean;
}

const PersonalContent = ({ reload }: Props) => {
  const storageFilterId = 'personal-filter';
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [persona, setPersona] = useState<any | undefined>(undefined);
  const { confirmAction } = useConfirm();
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || '';
  });

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.codigo,
        id: 'codigo',
        header: () => 'Código',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">{info.row.original.id}</span>,
        meta: {
          className: 'w-[100px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },

      {
        accessorFn: (row) => row.nombre,
        id: 'nombre1',
        header: () => 'Nombre',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">{info.row.original.persona.nombre1}</span>,
        meta: {
          className: 'min-w-[100px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.apellido,
        id: 'apellido1',
        header: () => 'Apellido',
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{info.row.original.persona.apellido1}</span>
        ),
        meta: {
          className: 'min-w-[100px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.identificacion,
        id: 'identificacion',
        header: () => 'Identificación',
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{info.row.original.persona.identificacion}</span>
        ),
        meta: {
          className: 'min-w-[100px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.celular,
        id: 'celular',
        header: () => 'Celular',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">{info.row.original.persona.celular}</span>,
        meta: {
          className: 'min-w-[100px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.porcentajeGanancia,
        id: 'porcentajeGanancia',
        header: () => 'Porcentaje De Ganancia',
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{info.row.original.porcentajeGanancia} %</span>
        ),
        meta: {
          className: 'min-w-[100px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },

      {
        accessorFn: (row) => row.descripcion,
        id: 'descripcion',
        header: () => 'Descripción',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">{info.row.original.descripcion}</span>,
        meta: {
          className: 'min-w-[100px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },

      {
        id: 'edit',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => {
              setIsModalOpen(true);
              setPersona(row.original);
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
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => {
              deletePersona(row.original.id);
            }}
          >
            <KeenIcon icon="trash" />
          </button>
        ),
        meta: { className: 'w-[60px]' }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('responsable_servicios');
      setPersonas(response.data);
    } catch (error) {
      setError('Error al cargar ');
    } finally {
      setLoading(false);
    }
  };

  const deletePersona = async (id: number) => {
    confirmAction('Esta acción eliminará esta persona.', async () => {
      try {
        await axios.delete(`responsable_servicios/${id}`);
        fetchData();
      } catch (err) {
        setError(`Error al eliminar : ${err}`);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, [reload]);

  const handleAfterSave = () => {
    fetchData();
    setIsModalOpen(false);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return personas;

    return personas.filter((dat) => {
      const porcentajeCotizacion = String(dat.porcentajeCotizacion || '').toLowerCase();
      const nivel = String(dat.nivel || '').toLowerCase();
      const search = searchTerm.toLowerCase();

      return porcentajeCotizacion.includes(search) || nivel.includes(search);
    });
  }, [searchTerm, personas]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="card card-grid min-w-full">
      <div className="card-header flex-wrap py-5">
        <h1 className="card-title">Gestion Personal</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <KeenIcon
              icon="magnifier"
              className="leading-none text-md text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Buscar Personal"
              className="input input-sm pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>

          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setIsModalOpen(true);
              setPersona(undefined);
            }}
          >
            Agregar Personal
          </button>
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

      <ModalPersonal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPersona(undefined);
        }}
        persona={persona}
        onSave={handleAfterSave}
      />
    </div>
  );
};

export { PersonalContent };
