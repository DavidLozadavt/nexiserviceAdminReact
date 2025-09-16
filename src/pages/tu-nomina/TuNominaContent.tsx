import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid, KeenIcon } from '@/components';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';

import { useConfirm } from '@/hooks';
import { ModalContrato } from './ModalContrato';
import { ModalVacaciones } from './ModalVacaciones';
import { ModalIncapacidades } from './ModalIncapacidades';
import { ModalDeducciones } from './ModalDeducciones';
import { ComisionModal } from './ComisionModal';

interface ContentProps {
  reload: boolean;
}

const TuNominaContent = ({ reload }: ContentProps) => {
  const storageFilterId = 'tarfiaR-filter';
  const [nominas, setNominas] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isModalOpenContrato, setIsModalOpenContrato] = useState(false);
  const [isModalOpenIncapacidades, setIsModalOpenIncapacidades] = useState(false);
  const [isModalOpenVacaciones, setIsModalOpenVacaciones] = useState(false);
  const [isModalOpenDeducciones, setIsModalOpenDeducciones] = useState(false);
  const [isModalComisionOpen, setIsModalComisionOpen] = useState(false);
  const [tarifa, setTarifa] = useState<any | undefined>(undefined);
  const { confirmAction } = useConfirm();
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || '';
  });

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: 'trabajador',
        header: () => 'Trabajador',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-center">
            <img
              src={row.original?.contrato?.persona?.rutaFotoUrl}
              alt="Foto"
              className="object-cover w-10 h-10 mb-2 rounded-full"
            />
            <span className="font-medium text-center text-gray-700">
              {row.original.contrato?.persona?.nombre1} {row.original.contrato?.persona?.apellido1}
            </span>
          </div>
        ),
        meta: {
          className: 'min-w-[130px]',
          cellClassName: 'items-center justify-center'
        }
      },

      {
        accessorFn: (row) => row.identificacion,
        id: 'identificacion',
        header: () => 'Identificación',
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">
            {info.row.original?.contrato?.persona?.identificacion}
          </span>
        ),
        meta: {
          className: 'min-w-[130px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.devengado,
        id: 'devengado',
        header: () => 'Devengado',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">${info.row.original.devengado}</span>,
        meta: {
          className: 'min-w-[120px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.netoPagado,
        id: 'netoPagado',
        header: () => 'Neto Pagado',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">${info.row.original.netoPagado}</span>,
        meta: {
          className: 'min-w-[120px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        id: 'totalSeguridad',
        header: () => 'Total Seguridad',
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-700">${row.original.totalSeguridad}</span>,
        meta: {
          className: 'min-w-[120px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        id: 'aportFiscales',
        header: () => 'Parafiscales',
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-700">${row.original.aportFiscales}</span>,
        meta: {
          className: 'min-w-[120px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        id: 'totalApropiaciones',
        header: () => 'Apropiaciones',
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-700">${row.original.totalApropiaciones}</span>,
        meta: {
          className: 'min-w-[120px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        id: 'valorTotalPorTrabajador',
        header: () => 'Costo Trabajador',
        enableSorting: true,
        cell: ({ row }) => <span className="text-gray-700">${row.original.valorTotalPorTrabajador}</span>,
        meta: {
          className: 'min-w-[120px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },

      {
        id: 'acciones',
        header: () => 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <button
              className="p-1"
              title="Contrato"
              onClick={() => {
                setIsModalOpenContrato(true);
              }}
            >
              <KeenIcon icon="notepad-bookmark" className="text-xl" />
            </button>

            <button
              title="Vacaciones"
              onClick={() => {
                setIsModalOpenVacaciones(true);
              }}
            >
              <KeenIcon icon="airplane" className="text-xl" />
            </button>

            <button
              title="Incapacidades y Licencias"
              className="p-1"
              onClick={() => {
                setIsModalOpenIncapacidades(true);
              }}
            >
              <KeenIcon icon="book-open" className="text-xl" />
            </button>

            <button
              title="Deducciones"
              className="p-1"
              onClick={() => {
                setIsModalOpenDeducciones(true);
              }}
            >
              <KeenIcon icon="chart-line-down-2" className="text-xl" />
            </button>

            <button
              title="Comisiones"
              className="p-1"
              onClick={() => {
                setIsModalComisionOpen(true);
              }}
            >
              <KeenIcon icon="tag" className="text-xl" />
            </button>
          </div>
        ),
        meta: {
          className: 'w-[100px]'
        }
      }
    ],
    []
  );

  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  const fetchTuNomina = async () => {
    setLoading(true);
    try {
      const response = await axios.get('nominas');
      setNominas(response.data);
    } catch (error) {
      setError('Error al cargar ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTuNomina();
  }, [reload]);

  const handleAfterSave = () => {
    fetchTuNomina();
    setIsModalOpenContrato(false);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return nominas;

    return nominas.filter((dat) => {});
  }, [searchTerm, nominas]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-w-full card card-grid">
      <div className="flex-wrap py-5 card-header">
        <h3 className="card-title">Contratos</h3>
        <div className="flex gap-6">
          <div className="relative">
            <KeenIcon
              icon="magnifier"
              className="absolute left-0 ml-3 leading-none text-gray-500 -translate-y-1/2 text-md top-1/2"
            />
            <input
              type="text"
              placeholder="Buscar Nominas"
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
        <DataGrid
          key={JSON.stringify(filteredData)}
          columns={columns}
          data={filteredData}
          pagination={{ size: 10 }}
        />

        {/* <div className="w-1/2 p-2 mt-4">
          <table className="w-full text-left border border-collapse border-gray-300 table-auto">
            <thead></thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border border-gray-300">Numero de Trabajadores</td>
                <td className="px-4 py-2 border border-gray-300">22</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-300">Total Nomina</td>
                <td className="px-4 py-2 border border-gray-300">$20.000.000</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-300">Parcial</td>
                <td className="px-4 py-2 border border-gray-300">$10.000.000</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-300">Deducciones</td>
                <td className="px-4 py-2 border border-gray-300">$10.000.000</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-300">Parafiscales</td>
                <td className="px-4 py-2 border border-gray-300">$10.000.000</td>
              </tr>
            </tbody>
          </table>
        </div> */}
      </div>

      <ModalContrato
        open={isModalOpenContrato}
        onClose={() => {
          setIsModalOpenContrato(false);
          setTarifa(undefined);
        }}
        data={tarifa}
        onSave={handleAfterSave}
      />

      <ModalVacaciones
        open={isModalOpenVacaciones}
        onClose={() => {
          setIsModalOpenVacaciones(false);
          setTarifa(undefined);
        }}
        data={tarifa}
        onSave={handleAfterSave}
      />

      <ModalIncapacidades
        open={isModalOpenIncapacidades}
        onClose={() => {
          setIsModalOpenIncapacidades(false);
          setTarifa(undefined);
        }}
        data={tarifa}
        onSave={handleAfterSave}
      />

      <ModalDeducciones
        open={isModalOpenDeducciones}
        onClose={() => {
          setIsModalOpenDeducciones(false);
          setTarifa(undefined);
        }}
        data={tarifa}
        onSave={handleAfterSave}
      />

      <ComisionModal
        open={isModalComisionOpen}
        onClose={() => {
          setIsModalComisionOpen(false);
          setTarifa(undefined);
        }}
        data={tarifa}
        onSave={handleAfterSave}
      />
    </div>
  );
};

export { TuNominaContent };
