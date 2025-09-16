import React, { useEffect, useMemo, useState } from 'react';
import { DataGrid, KeenIcon } from '@/components';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { ViajesModel } from '@/pages/transporte/cronograma-rutas/model/ViajesInterface';
import ModalAsignarConductor from '@/pages/transporte/cronograma-rutas/ModalAsignarConductor';
import ModalAsignarVehiculo from '@/pages/transporte/cronograma-rutas/ModalAsignarVehiculo';
import ModalAgendarViajes from '@/pages/transporte/cronograma-rutas/ModalAgendarViajes';
import Temporizador from './TemporizadorViaje';
import { useConfirm } from '@/hooks';

import ModalVentaTickets from './VentaTickets/ModalVentaTickets';
import ModalObservaciones from './ModalObservaciones';
import ModalPdfViewer from './ModalPdfViewer';
interface CajaContentProps {
  reload?: boolean;
}

const CajaContent = ({ reload }: CajaContentProps) => {
  const StorageFilteredId = 'filtered_id';
  const [viajes, setViajes] = useState<ViajesModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
  });
  const [selectedViajeId, setSelectedViajeId] = useState<number | null>(null);
  const { confirmAction } = useConfirm();

  const [isVehiculoModalOpen, setIsVehiculoModalOpen] = useState(false);
  const [isModalAgendarOpen, setIsModalAgendarOpen] = useState(false);
  const [isConductorModalOpen, setIsConductorModalOpen] = useState(false);
  const [isModalVentaTicketsOpen, setIsModalVentaTicketsOpen] = useState(false);
  const [isModalObservacionesOpen, setIsModalObservacionesOpen]= useState(false);
  const [selectedViaje, setSelectedViaje] = useState<ViajesModel | null>(null);
  const [modalPdfOpen, setModalPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [selectedRutaId, setSelectedRutaId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(StorageFilteredId) || '';
  });
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState<{ [key: number]: number }>({});


  useEffect(() => {
    localStorage.setItem(StorageFilteredId, searchTerm);
  }, [searchTerm]);

  const fetchViajes = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get('viajes', {
        params: {
          page: page,
        },
      });
      setViajes(response.data.viajes);
      setPagination({
        total: response.data.total,
        currentPage: page,
      });
    } catch (err) {
      setError(`Error fetching viajes: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = (id: number, time: number) => {
    setTiempoTranscurrido((prev) => ({
      ...prev,
      [id]: time,
    }));
  };

  const actualizarEstadoViaje = async (id: number) => {
    try {
      await axios.patch(`/viajes/${id}`, {
        estado: 'EN VIAJE',
      });
      await registrarCambioEstado(id, 'EN VIAJE', tiempoTranscurrido[id]); 
      fetchViajes(pagination.currentPage);
      generatePlanillaPDF(id);
    } catch (err) {
      setError(`Error actualizando el estado del viaje: ${err}`);
    }
  };

  const cambiarEstadoAPlanilla = async (id: number) => {
    try {
      await axios.patch(`/viajes/${id}`, {
        estado: 'PLANILLA',
      });
      await registrarCambioEstado(id, 'PLANILLA', tiempoTranscurrido[id] );
      fetchViajes(pagination.currentPage);
    } catch (err) {
      setError(`Error cambiando el estado a planilla: ${err}`);
    }
  };

  const cambiarEstadoCancelado = async (id: number) => {
    try {
      await axios.patch(`/viajes/${id}`, {
        estado: 'CANCELADO',
      });
      await registrarCambioEstado(id, 'CANCELADO', tiempoTranscurrido[id]); 
      fetchViajes(pagination.currentPage);
    } catch (err) {
      setError(`Error cambiando el estado a cancelado: ${err}`);
    }
  };

  const registrarCambioEstado = async (idViaje: number, estado: string, tiempoTranscurrido: number) => {
    try {
      await axios.post('/estado_viaje', {
        estado: estado,
        idViaje: idViaje,
        tiempoTranscurrido: tiempoTranscurrido, 
      });
    } catch (err) {
      console.error(`Error registrando el cambio de estado: ${err}`);
    }
  };

 
  
  const generatePlanillaPDF = async (idViaje:number) => {
    try {
  

      const response = await axios.get('/generate_planilla_pdf', {
        params: {
            idViaje: idViaje,
            action: 'generate_ticket'
        },
        responseType: 'blob'
    });
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      setPdfUrl(url); 
      setModalPdfOpen(true); 
    } catch (err) {
      setError(`Error generando la planilla PDF: ${err}`);
    }
  };
  const handleAfterSave = () => {
    fetchViajes();
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchViajes();
  }, [reload]);

  const columns = useMemo<ColumnDef<ViajesModel>[]>(
    () => [
      {
        accessorFn: (row) => row.id,
        id: 'id',
        header: () => 'Código',
        enableSorting: true,
        cell: (info) => <span className="text-gray-700">{info.row.original.id}</span>,
        className: 'min-w-[120px]',
        cellClassName: 'text-gray-700 font-normal'
      },

      {
        accessorFn: (row) => row.id,
        id: 'tiempo',
        enableSorting: true,
        cell: (info) => (
          <Temporizador
            estado={info.row.original.estado}
            id={info.row.original.id}
            onTimeUpdate={(time) => handleTimeUpdate(info.row.original.id, time)} 
          />
        ),
        className: 'min-w-[120px]',
        cellClassName: 'text-gray-700 font-normal',
      },

      {
        accessorFn: (row) => row.idVehiculo,
        id: 'Vehiculo',
        header: () => 'Vehículo',
        enableSorting: true,
        cell: (info) => {
          const vehiculo = info.row.original.vehiculo;
          const imagenVehiculo = vehiculo?.rutaUrl || '/public/media/images/default.png';

          return (
            <div className="flex items-center gap-2">
              <img
                src={imagenVehiculo}
                alt="Vehículo"
                className="w-10 h-10 rounded-full cursor-pointer hover:opacity-75"
                onClick={() => {
                  setSelectedViajeId(info.row.original.id);
                  setIsVehiculoModalOpen(true);
                }}
                title={vehiculo ? `${vehiculo.marca.marca} ${vehiculo.placa}` : 'No asignado'}
              />
              {vehiculo ? (
                <span className="text-xs">
                  {vehiculo.marca.marca} || {vehiculo.placa}
                </span>
              ) : (
                <span className="text-xs">No asignado</span>
              )}
            </div>
          );
        },
        meta: { className: 'min-w-[200px]', cellClassName: 'text-gray-700 font-normal' }
      },
      {
        accessorFn: (row) => row.idConductor,
        id: 'Conductor',
        header: () => 'Conductor',
        enableSorting: true,
        cell: (info) => {
          const conductor = info.row.original.conductor;
          const imagenConductor =
            conductor?.persona.rutaFotoUrl || '/public/media/brand-logos/user.svg';

          return (
            <div className="flex items-center gap-2">
              <img
                src={imagenConductor}
                alt="Conductor"
                className="w-10 h-10 rounded-full cursor-pointer hover:opacity-75"
                onClick={() => {
                  setSelectedViajeId(info.row.original.id);
                  setIsConductorModalOpen(true);
                }}
              />
              {conductor ? (
                <span className="text-xs">{`${conductor.persona.nombre1} ${conductor.persona.apellido1}`}</span>
              ) : (
                <span className="text-xs">No asignado</span>
              )}
            </div>
          );
        },
        meta: { className: 'min-w-[200px]', cellClassName: 'text-gray-700 font-normal' }
      },
      {
        accessorFn: (row) => row.ruta.ciudad_origen.descripcion,
        id: 'Origen',
        header: () => 'Origen',
        enableSorting: true,
        cell: (info) =>
          <span className="text-gray-700" >
            {info.row.original.ruta.ciudad_origen.descripcion}
          </span >
        ,
        meta: {
          className: 'min-w-[150px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },

      {
        accessorFn: (row) => row.ruta.ciudad_destino.descripcion,
        id: 'Destino',
        header: () => 'Destino',
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">{info.row.original.ruta.ciudad_destino.descripcion}</span>
        ),
        meta: {
          className: 'min-w-[150px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.tickets.length,
        id: 'tiquetes',
        header: () => 'Tiquetes',
        enableSorting: true,
        cell: (info) => {
          const ticketsCount = info.row.original.tickets ? info.row.original.tickets.length : 0;
          return (
            <span className="text-gray-700">
              {ticketsCount}
            </span>
          );
        },
        meta: {
          className: 'min-w-[150px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.estado,
        id: 'estado',
        header: () => 'Estado',
        enableSorting: true,
        cell: (info) => {
          let colorLetra;
          switch (info.row.original.estado) {
            case 'PLANILLA':
              colorLetra = '#EDED5C'; 
              break;
            case 'EN VIAJE':
              colorLetra = '#1DF51DFF'; 
              break;
            case 'CANCELADO':
              colorLetra = 'red'; 
              break;
            case 'PENDIENTE':
              colorLetra = 'gray';
              break;
            default:
              colorLetra = 'black'; 
              break;
          }
          return (
            <span
             
              style={{ 
                color: colorLetra, 
               
                cursor: 'pointer', 
              }}
              className={` text-gray-700 `}
            >
              {info.row.original.estado}
            </span>
          );
        },
        meta: {
          className: 'min-w-[150px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },
      {
        accessorFn: (row) => row.agendar_viajes?.hora ?? 'No agendado',
        id: 'hora',
        header: () => 'Hora',
        enableSorting: true,
        cell: (info) => (
          <span className="text-gray-700">
            {info.row.original.agendar_viajes?.hora ?? 'No agendado'}
          </span>
        ),
        meta: {
          className: 'min-w-[150px]',
          cellClassName: 'text-gray-700 font-normal'
        }
      },

      {
        id: 'acciones',
        header: () => 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const estado = row.original.estado;
      
          return (
            <div className="flex space-x-2">
              {estado === "PENDIENTE" && (
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() => {
                    confirmAction(
                      `¿Estás seguro de que deseas cambiar el estado a PLANILLA para el viaje: ${row.original.ruta.ciudad_origen.descripcion}-${row.original.ruta.ciudad_destino.descripcion}`,
                      () => cambiarEstadoAPlanilla(row.original.id)
                    );
                  }}
                  title="Cambiar estado a PLANILLA"
                >
                  <KeenIcon icon="book-open" />
                </button>
              )}
      
              {estado === "PLANILLA" && (
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  onClick={() => {
                    confirmAction(
                      `¿Estás seguro de que deseas iniciar el viaje: ${row.original.ruta.ciudad_origen.descripcion}-${row.original.ruta.ciudad_destino.descripcion}? `,
                      () => actualizarEstadoViaje(row.original.id)
                    );
                  }}
                  title="Iniciar viaje"
                >
                  <KeenIcon icon="bus" />
                </button>
              )}
      
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  confirmAction(
                    `¿Estás seguro de que deseas cancelar el viaje:  ${row.original.ruta.ciudad_origen.descripcion}-${row.original.ruta.ciudad_destino.descripcion}?  `,
                    () => cambiarEstadoCancelado(row.original.id)
                  );
                }}
                title="Cancelar viaje"
              >
                <KeenIcon icon="cross-square" />
              </button>
      
              {/* Botón de Venta de Tickets */}
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setSelectedViaje(row.original);
                  setIsModalVentaTicketsOpen(true);
                }}
                title="Venta de tickets"
              >
                <KeenIcon icon="cheque" />
              </button>
      
              {/* Botón de Mensaje */}
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => {
                  setSelectedViajeId(row.original.id);
                  setIsModalObservacionesOpen(true);
                }}
                title="Enviar mensaje"
              >
                <KeenIcon icon="message-text" />
              </button>
            </div>
          );
        },
        meta: { className: 'w-[200px]' }
      }
    ],
       // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const filteredData = useMemo(() => {
    if (!searchTerm) return viajes;
    return viajes.filter((paymentType) =>
      paymentType.ruta.ciudad_origen.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, viajes]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-w-full card card-grid">
      <div className="flex-wrap py-5 card-header">
        <h3 className="card-title"></h3>
        <div className="flex gap-6">
          <div className="relative">
            <KeenIcon
              icon="magnifier"
              className="absolute left-0 ml-3 leading-none text-gray-500 -translate-y-1/2 text-md top-1/2"
            />
            <input
              type="text"
              placeholder="Buscar ruta..."
              className="pl-8 input input-sm"
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
          sorting={[{ id: 'nombreTipo', desc: false }]}
        />
      </div>
      <ModalAsignarConductor
        open={isConductorModalOpen}
        onClose={() => {
          setIsConductorModalOpen(false);
          setSelectedViajeId(null);
        }}
        idViaje={selectedViajeId ?? 0}
        onSave={() => {
          fetchViajes();
        }}
      />
      <ModalAsignarVehiculo
        open={isVehiculoModalOpen}
        onClose={() => {
          setIsVehiculoModalOpen(false);
          setSelectedViajeId(null);
        }}
        idViaje={selectedViajeId ?? 0}
        onSave={(vehiculo, observacion) => {
          fetchViajes();
        }}
      />
      <ModalAgendarViajes
        open={isModalAgendarOpen}
        onClose={() => {
          setIsModalAgendarOpen(false);
          setSelectedViajeId(null);
        }}
        idViaje={selectedViajeId ?? 0}
        onSave={() => {
          fetchViajes();
        }}
      />
      <ModalVentaTickets
        open={isModalVentaTicketsOpen}
        onClose={() => {
          setIsModalVentaTicketsOpen(false);
          setSelectedRutaId(null);
        }}
        viajeData={selectedViaje!}
      />

     <ModalObservaciones
       open={isModalObservacionesOpen}
       onClose={() => {
         setIsModalObservacionesOpen(false);
         setSelectedViajeId(null);
       }}
       idViaje={selectedViajeId?? 0}
     
     />

 <ModalPdfViewer
        isOpen={modalPdfOpen}
        onClose={() => {
          setModalPdfOpen(false);
          setPdfUrl(null); 
        }}
        pdfUrl={pdfUrl}
      />
    </div>
  );
};


export default CajaContent