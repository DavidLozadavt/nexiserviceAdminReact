import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Container } from '@/components/container';
import { DataGrid, KeenIcon } from '@/components';
import { ColumnDef } from '@tanstack/react-table';
import GetCotizacion from '../gestionde-pedidos/modales/GetCotizacion';

interface Cliente {
  nombre1?: string;
  apellido1?: string;
}

interface Cotizacion {
  idCotizacion: string;
  cliente: Cliente;
  fecha?: string;
  subtotal?: number;
  totalProductos?: number;
  estado?: string;
}

const GestionCotizaciones: React.FC = () => {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<Cotizacion | null>(null);
  const [showCotizacion, setShowCotizacion] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const [pageActual, setPageActual] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCotizaciones, setTotalCotizaciones] = useState(0);

  const [loading, setLoading] = useState(false);

  // Debounce para la búsqueda (antes del fetch)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch de cotizaciones (igual lógica que el componente de tu parcero)
  const fetchCotizaciones = useCallback(
    async (page = 1, reset = false) => {
      if (loading) return;
      setLoading(true);

      try {
        const response = await axios.get(
          `/get_cotizaciones?search=${encodeURIComponent(debouncedSearch)}&per_page=${perPage}&page=${page}`
        );

        // Normalizar la respuesta: puede venir data.data como array o como objeto
        const respData = response.data || {};
        let raw: any[] = [];

        if (Array.isArray(respData.data)) {
          raw = respData.data;
        } else if (respData.data && typeof respData.data === 'object') {
          raw = Object.values(respData.data).flat();
        }

        // Mapear a la forma que usamos en la tabla
        const mapped: Cotizacion[] = raw.map((c: any) => ({
          idCotizacion: (c.idCotizacion || c.id || '—').toString(),
          cliente: {
            nombre1: c.nombreCliente || c.cliente?.nombre1 || 'Cliente',
            apellido1: c.apellidoCliente || c.cliente?.apellido1 || ''
          },
          fecha: c.fecha || c.created_at || c.fechaCotizacion || null,
          subtotal:
            typeof c.subtotal === 'number'
              ? c.subtotal
              : (parseFloat(c.valorUnitario || 0) * parseFloat(c.cantidad || 0)) || 0,
          totalProductos: parseInt(c.cantidad || c.totalProductos || 0, 10) || 0,
          estado: (c.estado || 'PENDIENTE').toString()
        }));

        // Si reset, reemplazamos; si no, concatenamos (cargar más)
        setCotizaciones((prev) => (reset ? mapped : [...prev, ...mapped]));

        // Totales y paginación (adaptar si tu API usa campos distintos)
        setTotalCotizaciones(respData.total ?? mapped.length);
        setTotalPaginas(respData.last_page ?? 1);
        setPageActual(respData.current_page ?? page);
      } catch (error) {
        console.error('Error cargando cotizaciones:', error);
        // En fallo, reseteamos lista
        if (page === 1) {
          setCotizaciones([]);
          setTotalCotizaciones(0);
          setTotalPaginas(1);
          setPageActual(1);
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, perPage, loading]
  );

  // Efecto: cargar al inicio y cuando cambia búsqueda o perPage
  useEffect(() => {
    fetchCotizaciones(1, true);
  }, [debouncedSearch, perPage]);

  // Cargar más (igual que en el componente de tu compañero)
  const cargarMas = () => {
    if (pageActual < totalPaginas && !loading) {
      const nuevaPagina = pageActual + 1;
      setPageActual(nuevaPagina);
      fetchCotizaciones(nuevaPagina, false);
    }
  };

  // Abrir modal
  const abrirModalCotizacion = (c: Cotizacion) => {
    setCotizacionSeleccionada(c);
    setShowCotizacion(true);
  };

  const cerrarModal = () => {
    setCotizacionSeleccionada(null);
    setShowCotizacion(false);
  };

  // Columnas para DataGrid (memoizadas)
  const columns: ColumnDef<Cotizacion>[] = useMemo(
    () => [
      { accessorKey: 'idCotizacion', header: 'Número de Cotización' },
      {
        id: 'cliente',
        header: 'Cliente',
        accessorFn: (row: Cotizacion) =>
          `${row.cliente?.nombre1 ?? ''} ${row.cliente?.apellido1 ?? ''}`.trim()
      },
      {
        accessorKey: 'fecha',
        header: 'Fecha de Cotización',
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue() as string).toLocaleString('es-CO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            : ''
      },
      { accessorKey: 'totalProductos', header: 'Cantidad de Productos' },
      {
        accessorKey: 'subtotal',
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
          const estado = (info.getValue() as string) ?? '';
          let clase = '';
          if (estado === 'PAGO') clase = 'bg-warning';
          else if (estado === 'FINALIZADO') clase = 'bg-success';
          else if (['ENVIADO', 'ENVIO CLIENTE', 'ENVIO GRATIS'].includes(estado)) clase = 'bg-primary';
          else if (['GARANTIA', 'RECHAZADO'].includes(estado)) clase = 'bg-danger';
          return <span className={`badge text-white px-3 py-2 ${clase}`}>{estado}</span>;
        }
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <button
            className="btn btn-sm btn-light-primary flex items-center gap-1"
            onClick={() => abrirModalCotizacion(row.original)}
          >
            <KeenIcon icon="eye" className="text-primary" />
            Ver cotización
          </button>
        )
      }
    ],
    []
  );

  // Rango mostrado (para texto "Mostrando X de Y")
  const desde = (pageActual - 1) * perPage + 1;
  const hasta = Math.min(pageActual * perPage, totalCotizaciones);

  return (
    <Container>
      <div className="card card-grid min-w-full">
        <div className="card-header flex-wrap py-5">
          <h3 className="card-title">Gestión de Cotizaciones</h3>

          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="absolute top-1/2 left-0 -translate-y-1/2 ml-3 text-gray-500"
              />
              <input
                type="text"
                placeholder="Buscar cotizaciones..."
                className="input input-sm pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageActual(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="card-body">
          {cotizaciones.length === 0 && loading ? (
            <div className="text-center py-10">Cargando cotizaciones...</div>
          ) : cotizaciones.length === 0 && !loading ? (
            <div className="text-center py-10 text-muted">No se encontraron cotizaciones</div>
          ) : (
            <DataGrid columns={columns} data={cotizaciones} />
          )}
        </div>
      </div>

      {/* Modal */}
      <GetCotizacion 
        open={showCotizacion} 
        cotizacion={cotizacionSeleccionada} 
        onClose={cerrarModal} 
      />
    </Container>
  );
};

export default GestionCotizaciones;
