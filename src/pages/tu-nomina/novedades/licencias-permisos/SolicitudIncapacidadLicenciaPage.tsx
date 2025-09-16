import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataGrid, KeenIcon } from '@/components';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { Fragment, useRef } from 'react';
import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { useLayout } from '@/providers';

import { useConfirm } from '@/hooks';
import { ModalSolicitudIncapacidadLicencia } from './ModalSolicitudIncapacidadLicencia';
import { ModalSoportesIncapacidadLicencia } from './ModalSoportesIncapacidadLicencia';
import { SolicitudesIncapacidadInterface } from '../models/SolicitudesIncapacidadInterface';
import { ModalObservacacionesLicencias } from './ModalObservacacionesLicencias';

interface ContentProps {
  reload?: boolean;
}

const SolicitudIncapacidadLicenciaPage = ({ reload }: ContentProps) => {
  const { currentLayout } = useLayout();
  const storageFilterId = 'solicitud_incap_trabajador-filter';
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenObservacion, setIsModalOpenObservacion] = useState(false);
  const [isModalOpenSoporte, setIsModalOpenSoporte] = useState(false);
  const { confirmAction } = useConfirm();
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || '';
  });
  const [solicitud, setSolicitud] = useState<SolicitudesIncapacidadInterface | undefined>(
    undefined
  );
  const [solicitudes, setSolicitudes] = useState<SolicitudesIncapacidadInterface[]>([]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.id,
        id: 'id',
        header: () => 'Código',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">{info.row.original.id}</span>,
        meta: {
          className: 'min-w-[50px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.fechaInicial,
        id: 'fechaInicial',
        header: () => 'Fecha Inicial',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">{info.row.original.fechaInicial}</span>,
        meta: {
          className: 'min-w-[100px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.fechaFinal,
        id: 'fechaFinal',
        header: () => 'Fecha Final',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">{info.row.original.fechaFinal}</span>,
        meta: {
          className: 'min-w-[100px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.tipo,
        id: 'tipo',
        header: () => 'Tipo',
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">
            {info.row.original.tipo_incapacidad.tipoIncapacidad}
          </span>
        ),
        meta: {
          className: 'min-w-[120px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.numDias,
        id: 'numDias',
        header: () => 'N° de Días',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">{info.row.original.numDias}</span>,
        meta: {
          className: 'min-w-[80px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },

      {
        accessorFn: (row) => row.estado,
        id: 'estado',
        header: () => 'Estado',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">{info.row.original.estado}</span>,
        meta: {
          className: 'min-w-[100px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        id: 'acciones',
        header: () => 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="text-center">
            <a
              href={row.original.rutaSoporte}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1"
              title="Soportes"
            >
              <KeenIcon icon="some-files" className="text-xl" />
            </a>
            <button
              className="p-1"
              title="Editar"
              onClick={() => {
                setIsModalOpen(true);
                setSolicitud(row.original);
              }}
            >
              <KeenIcon icon="notepad-edit" className="text-xl" />
            </button>{' '}
            <button
              title="Observación"
              onClick={() => {
                setIsModalOpenObservacion(true);
                setSolicitud(row.original);
              }}
            >
              <KeenIcon icon="messages" className="text-xl" />
            </button>
          </div>
        ),
        meta: {
          className: 'w-[150px]'
        }
      }
    ],
    []
  );

  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  const fetchSoliciutudesIncapacidadPersona = async () => {
    setLoading(true);
    try {
      const response = await axios.get('get_my_solicitudes_worker');
      setSolicitudes(response.data);
    } catch (error) {
      setError('Error al cargar ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoliciutudesIncapacidadPersona();
  }, []);

  const handleAfterSave = () => {
    fetchSoliciutudesIncapacidadPersona();
    setIsModalOpen(false);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return solicitudes;

    return solicitudes.filter((dat) => {
      const fechaSolicitudMatch = dat.fechaSolicitud.includes(searchTerm);
      const fechaInicialMatch = dat.fechaInicial.includes(searchTerm);
      const fechaFinalMatch = dat.fechaFinal.includes(searchTerm);
      const tipoIncapacidadMatch = dat.tipo_incapacidad?.tipoIncapacidad
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return fechaSolicitudMatch || fechaInicialMatch || fechaFinalMatch || tipoIncapacidadMatch;
    });
  }, [searchTerm, solicitudes]);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                Solicitud de Incapacidades y Licencias - Trabajador
              </h1>
              <ToolbarDescription>
                Gestiona Tus Solicitudes de Incapacidades y Licencias
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <button className="btn btn-sm btn-light" onClick={handleModalOpen}>
                Crear Solicitud
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <div className="card card-grid min-w-full">
          <div className="card-header flex-wrap py-5">
            <h3 className="card-title">Solicitudes de Incapacidades y Licencias</h3>
            <div className="flex gap-6">
              <div className="relative">
                <KeenIcon
                  icon="magnifier"
                  className="leading-none text-md text-gray-500 absolute top-1/2 left-0 -translate-y-1/2 ml-3"
                />
                <input
                  type="text"
                  placeholder="Buscar Solicitudes"
                  className="input input-sm pl-8"
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
          </div>

          <ModalSolicitudIncapacidadLicencia
            open={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSolicitud(undefined);
            }}
            data={solicitud}
            onSave={handleAfterSave}
          />

          <ModalObservacacionesLicencias
            open={isModalOpenObservacion}
            onClose={() => {
              setIsModalOpenObservacion(false);
              setSolicitud(undefined);
            }}
            data={solicitud}
          />

          <ModalSoportesIncapacidadLicencia
            open={isModalOpenSoporte}
            onClose={() => {
              setIsModalOpenSoporte(false);
              // setTarifa(undefined);
            }}
            data={solicitud}
            // onSave={handleAfterSave}
          />
        </div>
      </Container>
    </Fragment>
  );
};

export { SolicitudIncapacidadLicenciaPage };
