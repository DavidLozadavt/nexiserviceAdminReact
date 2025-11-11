import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Container } from '@/components/container';
import { DataGrid, KeenIcon } from '@/components';
import { ColumnDef } from '@tanstack/react-table';
import VerPedido from './modales/VerPedido'; // 🔹 importamos el modal

interface Tercero {
  nombre: string;
}

interface Asignacion {
  cantidad: number;
  valorUnitario: number;
}

interface Pedido {
  id: number;
  tercero: Tercero;
  updated_at: string;
  origen: string;
  estado: string;
  asignaciones: Asignacion[];
}

const Pedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [pageActual, setPageActual] = useState(1);
  const [perPage] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔹 Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  const abrirModalPedido = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setModalOpen(true);
  };

  // 🔹 Debounce búsqueda
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 🔹 Cargar pedidos
  const fetchPedidos = useCallback(
    async (page = 1, reset = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const response = await axios.get(
          `/get_pedidos?search=${encodeURIComponent(debouncedSearch)}&per_page=${perPage}&page=${page}`
        );
        const data = response.data.data || [];
        setPedidos((prev) => (reset ? data : [...prev, ...data]));
        setTotalPedidos(response.data.total || 0);
        setTotalPaginas(response.data.last_page || 1);
      } catch (error) {
        console.error('Error cargando pedidos:', error);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, perPage, loading]
  );

  useEffect(() => {
    setPageActual(1);
    fetchPedidos(1, true);
  }, [debouncedSearch, fetchPedidos]);

  const getSubtotal = (pedido: Pedido) =>
    pedido.asignaciones.reduce(
      (subtotal, item) => subtotal + item.cantidad * item.valorUnitario,
      0
    );

  const columns: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: 'Número de Pedido' },
    { accessorFn: (row: Pedido) => row.tercero.nombre, header: 'Cliente' },
    {
      accessorKey: 'updated_at',
      header: 'Fecha',
      cell: (info) => new Date(info.getValue() as string).toLocaleDateString()
    },
    { accessorKey: 'origen', header: 'Origen' },
    {
      accessorFn: (row: Pedido) => getSubtotal(row),
      header: 'Subtotal',
      cell: (info) =>
        (info.getValue() as number).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: (info) => {
        const estado = info.getValue() as string;
        let clase = '';
        if (estado === 'PAGO') clase = 'bg-warning';
        else if (estado === 'FINALIZADO') clase = 'bg-success';
        else if (['ENVIADO', 'ENVIO CLIENTE', 'ENVIO GRATIS'].includes(estado))
          clase = 'bg-primary';
        else if (['GARANTIA', 'RECHAZADO'].includes(estado)) clase = 'bg-danger';
        return <span className={`badge text-white px-3 py-2 ${clase}`}>{estado}</span>;
      }
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => (
        <div className="flex justify-center gap-2">
          <button
            className="btn btn-sm btn-light btn-primary"
            onClick={() => abrirModalPedido(info.row.original)} // 🔹 abrir modal
          >
            <KeenIcon icon="notepad-edit" />
          </button>
        </div>
      )
    }
  ];

  const cargarMas = () => {
    if (pageActual < totalPaginas && !loading) {
      const nuevaPagina = pageActual + 1;
      setPageActual(nuevaPagina);
      fetchPedidos(nuevaPagina);
    }
  };

  return (
    <Container>
      <div className="card card-grid min-w-full">
        <div className="card-header flex-wrap py-5">
          <h3 className="card-title">Gestión de Pedidos</h3>
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="absolute top-1/2 left-0 -translate-y-1/2 ml-3 text-gray-500"
              />
              <input
                type="text"
                placeholder="Buscar pedidos..."
                className="input input-sm pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card-body">
          {pedidos.length === 0 && loading ? (
            <div className="text-center py-10">Cargando pedidos...</div>
          ) : (
            <DataGrid columns={columns} data={pedidos} />
          )}

          {pageActual < totalPaginas && (
            <div className="flex justify-center mt-4">
              <button className="btn btn-primary" onClick={cargarMas} disabled={loading}>
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Modal */}
      <VerPedido open={modalOpen} pedido={pedidoSeleccionado} onClose={() => setModalOpen(false)} />
    </Container>
  );
};

export default Pedidos;
