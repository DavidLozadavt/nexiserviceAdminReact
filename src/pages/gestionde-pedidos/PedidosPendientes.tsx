import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Container } from '@/components/container';
import { DataGrid, KeenIcon } from '@/components';
import { ColumnDef } from '@tanstack/react-table';
import VerPedidoPendi from './modales/VerPedidosPendi';

interface Tercero {
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

interface Producto {
  caracteristicas?: string;
  marca?: { nombre?: string };
  medida?: { valor?: number; unidadMedida?: string };
  peso?: number;
  cantidadDistribucionesAceptadas?: number;
}

interface Asignacion {
  cantidad: number;
  valorUnitario: number;
  producto?: Producto;
  gananciaTotal?: number;
}

interface PedidoPendiente {
  id: number;
  tercero: Tercero;
  updated_at: string;
  origen: string;
  estado: string;
  asignaciones: Asignacion[];
}

const PedidosPendientes: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoPendiente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageActual, setPageActual] = useState(1);
  const [perPage] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoPendiente | null>(null);
  const [sinResultados, setSinResultados] = useState(false);

  // 🔹 Debounce de búsqueda
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 🔹 Cargar pedidos pendientes (optimizado sin loops infinitos)
  const fetchPedidosPendientes = useCallback(
    async (page = 1, reset = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const { data } = await axios.get(
          `/get_pedidos_pendientes?search=${encodeURIComponent(debouncedSearch)}&per_page=${perPage}&page=${page}`
        );

        const pedidosData = data?.data || [];
        const total = data?.total || 0;
        const lastPage = data?.last_page || 1;

        if (pedidosData.length === 0) {
          setPedidos([]);
          setTotalPedidos(0);
          setTotalPaginas(1);
          setSinResultados(true);
          return;
        }

        setSinResultados(false);
        setPedidos(reset ? pedidosData : (prev) => [...prev, ...pedidosData]);
        setTotalPedidos(total);
        setTotalPaginas(lastPage);
      } catch (error) {
        console.error('Error cargando pedidos pendientes:', error);
        setPedidos([]);
        setSinResultados(true);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, perPage] // ✅ solo lo necesario
  );

  // 🔹 Cargar pedidos cuando cambia la búsqueda o se inicia
  useEffect(() => {
    setPageActual(1);
    fetchPedidosPendientes(1, true);
  }, [debouncedSearch, fetchPedidosPendientes]);

  // 🔹 Calcular subtotal
  const getSubtotal = (pedido: PedidoPendiente) =>
    pedido.asignaciones.reduce(
      (subtotal, item) => subtotal + item.cantidad * item.valorUnitario,
      0
    );

  // 🔹 Mostrar tiempo o fecha
  const getTimeAgoOrDate = (updatedAt: string) => {
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffMs = now.getTime() - updatedDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 2) return updatedDate.toLocaleDateString('es-CO');

    const seconds = Math.floor(diffMs / 1000);
    const intervals: Record<string, number> = {
      año: 31536000,
      mes: 2592000,
      día: 86400,
      hora: 3600,
      minuto: 60,
      segundo: 1
    };

    for (const key in intervals) {
      const interval = Math.floor(seconds / intervals[key]);
      if (interval >= 1) return `Hace ${interval} ${key}${interval !== 1 ? 's' : ''}`;
    }
    return 'hace unos segundos';
  };

  // 🔹 Columnas
  const columns: ColumnDef<PedidoPendiente>[] = [
    { accessorKey: 'id', header: 'Número de Pedido' },
    { accessorFn: (row) => row.tercero.nombre, header: 'Cliente' },
    {
      accessorFn: (row) => row.updated_at,
      header: 'Fecha',
      cell: (info) => getTimeAgoOrDate(info.getValue() as string)
    },
    { accessorKey: 'origen', header: 'Origen' },
    {
      accessorFn: (row) => getSubtotal(row),
      header: 'Subtotal',
      cell: (info) =>
        (info.getValue() as number).toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP'
        })
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: (info) => {
        const estado = info.getValue() as string;
        const colores: Record<string, string> = {
          PENDIENTE: 'bg-warning',
          PAGO: 'bg-info',
          FINALIZADO: 'bg-success',
          RECHAZADO: 'bg-danger'
        };
        const color = colores[estado] || 'bg-secondary';
        return <span className={`badge text-white px-3 py-2 ${color}`}>{estado}</span>;
      }
    },
    {
      id: 'acciones',
      header: 'Acción',
      cell: ({ row }) => (
        <button
          className="btn btn-sm btn-light-primary flex items-center gap-1"
          onClick={() => setPedidoSeleccionado(row.original)}
        >
          <KeenIcon icon="eye" className="text-primary" />
          Ver pedido
        </button>
      )
    }
  ];

  // 🔹 Cargar más
  const cargarMas = () => {
    if (pageActual < totalPaginas && !loading) {
      const nuevaPagina = pageActual + 1;
      setPageActual(nuevaPagina);
      fetchPedidosPendientes(nuevaPagina);
    }
  };

  return (
    <Container>
      <div className="card card-grid min-w-full">
        <div className="card-header flex-wrap py-5">
          <h3 className="card-title">Gestión de Pedidos Pendientes</h3>
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="absolute top-1/2 left-0 -translate-y-1/2 ml-3 text-gray-500"
              />
              <input
                type="text"
                placeholder="Buscar pedidos pendientes..."
                className="input input-sm pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card-body">
          {loading && <div className="text-center py-10 text-muted">Cargando pedidos...</div>}

          {!loading && sinResultados && (
            <div className="text-center py-10 text-muted">No se encontraron pedidos pendientes</div>
          )}

          {!loading && !sinResultados && pedidos.length > 0 && (
            <>
              <DataGrid columns={columns} data={pedidos} />

              {pageActual < totalPaginas && (
                <div className="flex justify-center mt-4">
                  <button className="btn btn-primary" onClick={cargarMas} disabled={loading}>
                    {loading ? 'Cargando...' : 'Cargar más'}
                  </button>
                </div>
              )}

              <div className="text-center text-sm text-muted mt-3">
                Mostrando {pedidos.length} de {totalPedidos} pedidos
              </div>
            </>
          )}
        </div>
      </div>

      {pedidoSeleccionado && (
        <VerPedidoPendi
          open={true}
          pedido={pedidoSeleccionado as any}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}
    </Container>
  );
};

export default PedidosPendientes;