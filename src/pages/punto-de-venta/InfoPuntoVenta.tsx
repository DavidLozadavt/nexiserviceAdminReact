import React, { useEffect, useState, useMemo } from 'react';
import { DataGrid, KeenIcon } from '@/components';
import { Container } from '@/components/container';
import axios from 'axios';

interface Props {
  punto: { id: number; nombre: string };
  onBack: () => void;
}

interface Persona {
  nombre1?: string;
  apellido1?: string;
  rutaFotoUrl?: string;
}

interface Usuario {
  persona?: Persona;
}

interface Estado {
  estado?: string;
}

interface Caja {
  id: number;
  usuario?: Usuario;
  estado?: Estado;
  fecha: string;
  updated_at: string;
  valorEfectivo?: number;
  valorGasto?: number;
  valorTransaccion?: number;
  excedente?: string;
  observacion?: string;
}

const InfoPuntoVenta: React.FC<Props> = ({ punto, onBack }) => {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObs, setSelectedObs] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCajas = async () => {
      try {
        const res = await axios.get<Caja[]>(`get_boxes_by_point_of_sale/${punto.id}`);
        setCajas(res.data);
      } catch (error) {
        console.error('Error al cargar cajas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCajas();
  }, [punto]);

  const filteredCajas = useMemo(() => {
    if (!searchTerm) return cajas;
    return cajas.filter((caja) => {
      const nombre =
        `${caja.usuario?.persona?.nombre1 || ''} ${caja.usuario?.persona?.apellido1 || ''}`.toLowerCase();
      return nombre.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, cajas]);

  const columns = useMemo(
    () => [
      {
        accessorFn: (row: Caja) => row.usuario?.persona,
        id: 'cajero',
        header: 'Cajero',
        cell: ({ row }: { row: { original: Caja } }) => {
          const u = row.original.usuario?.persona;
          return (
            <div className="flex flex-col items-center">
              {u?.rutaFotoUrl && (
                <img
                  src={u.rutaFotoUrl}
                  alt="Foto"
                  className="w-8 h-8 rounded-full mb-1 object-cover"
                />
              )}
              <span className="text-gray-700 dark:text-gray-200 font-medium text-center text-sm">
                {u ? `${u.nombre1} ${u.apellido1}` : 'Sin asignar'}
              </span>
            </div>
          );
        }
      },
      {
        accessorFn: (row: Caja) => row.estado?.estado,
        id: 'estado',
        header: 'Estado',
        cell: ({ row }: { row: { original: Caja } }) => {
          const isOpen = row.original.estado?.estado?.toLowerCase() === 'abierto';
          return (
            <span
              className={`${
                isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              } font-semibold text-sm`}
            >
              {isOpen ? 'Abierto' : 'Cerrado'}
            </span>
          );
        }
      },
      {
        accessorFn: (row: Caja) => row.fecha,
        id: 'fecha',
        header: 'Fecha Apertura',
        cell: ({ row }: { row: { original: Caja } }) =>
          new Date(row.original.fecha).toLocaleString()
      },
      {
        accessorFn: (row: Caja) => row.updated_at,
        id: 'actualizacion',
        header: 'Última Actualización',
        cell: ({ row }: { row: { original: Caja } }) =>
          new Date(row.original.updated_at).toLocaleString()
      },
      {
        accessorFn: (row: Caja) => row.valorEfectivo,
        id: 'efectivo',
        header: 'Efectivo',
        cell: ({ row }: { row: { original: Caja } }) =>
          `$${Intl.NumberFormat('es-CO').format(row.original.valorEfectivo || 0)}`
      },
      {
        accessorFn: (row: Caja) => row.valorGasto,
        id: 'gasto',
        header: 'Gasto',
        cell: ({ row }: { row: { original: Caja } }) =>
          `$${Intl.NumberFormat('es-CO').format(row.original.valorGasto || 0)}`
      },
      {
        accessorFn: (row: Caja) => row.valorTransaccion,
        id: 'transferencias',
        header: 'Transferencias',
        cell: ({ row }: { row: { original: Caja } }) =>
          `$${Intl.NumberFormat('es-CO').format(row.original.valorTransaccion || 0)}`
      },
      {
        accessorFn: (row: Caja) => row.excedente,
        id: 'excedente',
        header: 'Excedente',
        cell: ({ row }: { row: { original: Caja } }) => row.original.excedente || '-'
      },
      {
        accessorFn: (row: Caja) => row.observacion,
        id: 'observacion',
        header: 'Observación',
        cell: ({ row }: { row: { original: Caja } }) =>
          row.original.observacion ? (
            <button
              onClick={() => setSelectedObs(row.original.observacion!)}
              className="btn btn-sm btn-light"
            >
              Ver
            </button>
          ) : (
            '-'
          )
      }
    ],
    []
  );

  if (loading) return <div>Cargando...</div>;

  return (
    <Container className="max-w-5xl mx-auto">
      <div className="min-w-full card card-grid">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between py-5 card-header">
          <h3 className="card-title text-lg font-semibold">Cajas de {punto.nombre}</h3>
          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="btn btn-sm btn-light border rounded px-3 py-1 hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              Volver
            </button>
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="absolute left-0 ml-3 leading-none text-gray-500 dark:text-gray-300 -translate-y-1/2 text-md top-1/2"
              />
              <input
                type="text"
                placeholder="Buscar cajero..."
                className="pl-8 input input-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="card-body max-h-[400px] overflow-auto">
          <DataGrid
            key={JSON.stringify(filteredCajas)}
            columns={columns}
            data={filteredCajas}
            pagination={{ size: 10 }}
          />
        </div>

        {/* MODAL OBSERVACIÓN */}
        {selectedObs && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white dark:bg-neutral-950 rounded-2xl p-4 w-80 max-h-80 overflow-auto shadow-xl">
              <h3 className="text-lg font-bold mb-3 text-neutral-900 dark:text-neutral-50">
                Observación
              </h3>
              <div className="overflow-y-auto max-h-56 pr-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedObs}
                </p>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button
                  onClick={() => setSelectedObs(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default InfoPuntoVenta;
