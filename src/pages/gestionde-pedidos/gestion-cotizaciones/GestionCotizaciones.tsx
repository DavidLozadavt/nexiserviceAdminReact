import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { Container } from '@/components/container';
import { KeenIcon } from '@/components';
import ListCotizaciones from './ListCotizaciones';
import GetCotizacion from '../modales/modales-cotizacion/GetCotizacion';

const GestionCotizaciones: React.FC = () => {
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<any | null>(null);
  const [showCotizacion, setShowCotizacion] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageActual, setPageActual] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalProductos, setTotalProductos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sinResultados, setSinResultados] = useState(false);

  const fetchRef = useRef(false); // Evita llamadas duplicadas

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Traer cotizaciones del backend
  const fetchCotizaciones = useCallback(
    async (page = 1, reset = false) => {
      if (fetchRef.current) return;
      fetchRef.current = true;
      setLoading(true);

      try {
        const { data } = await axios.get(
          `/get_cotizaciones?search=${encodeURIComponent(debouncedSearch)}&per_page=${perPage}&page=${page}`
        );

        // convertimos el objeto en array
        let cotData: any[] = [];

        if (data?.data) {
          if (Array.isArray(data.data)) {
            cotData = data.data;
          } else if (typeof data.data === 'object') {
            // Si viene como {12345: [ {...} ]}, convertimos todo a un solo array
            cotData = Object.values(data.data).flat();
          }
        }

        // Mapea los campos que usa la tabla
        const cotFormateadas = cotData.map((c: any) => ({
          idCotizacion: c.idCotizacion?.toString() || c.id?.toString() || '—',
          cliente: {
            nombre1: c.nombreCliente || 'Cliente',
            apellido1: c.apellidoCliente || '',
          },
          fecha: c.fecha || new Date().toISOString(),
          subtotal: parseFloat(c.valorUnitario || 0) * parseFloat(c.cantidad || 0),
          totalProductos: parseInt(c.cantidad || 0),
          estado: c.estado || 'PENDIENTE',
        }));

        if (cotFormateadas.length === 0) {
          setCotizaciones([]);
          setTotalProductos(0);
          setTotalPaginas(1);
          setSinResultados(true);
        } else {
          setSinResultados(false);
          setCotizaciones(reset ? cotFormateadas : [...cotizaciones, ...cotFormateadas]);
          setTotalProductos(data?.total || cotFormateadas.length);
          setTotalPaginas(data?.last_page || 1);
          setPageActual(data?.current_page || 1);
        }
      } catch (error) {
        setCotizaciones([]);
        setSinResultados(true);
      } finally {
        setLoading(false);
        fetchRef.current = false;
      }
    },
    [debouncedSearch, perPage, cotizaciones]
  );

  // Efecto principal (carga inicial y cambios)
  useEffect(() => {
    fetchCotizaciones(1, true);
  }, [debouncedSearch, perPage]);

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPageActual(1);
  };

  const handlePageChange = (page: number) => {
    setPageActual(page);
    fetchCotizaciones(page, true);
  };

  const handleNumRegChange = (num: number) => {
    setPerPage(num);
    setPageActual(1);
  };

  const handleGestion = (data: any) => {
    console.log('🧩 Cotización original:', data);

    setCotizacionSeleccionada(data);
    setShowCotizacion(true);
  };

  const handleCloseModal = () => {
    setCotizacionSeleccionada(null);
    setShowCotizacion(false);
  };

  return (
    <Container>
      <div className="card card-grid">
        <div className="card-header flex-wrap py-5">
          <h3 className="card-title">Gestión de Cotizaciones</h3>
          <div className="flex gap-4">
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
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card-body">
          {loading && <div className="text-center py-10 text-muted">Cargando cotizaciones...</div>}

          {!loading && sinResultados && (
            <div className="text-center py-10 text-muted">No se encontraron cotizaciones</div>
          )}

          {!loading && !sinResultados && cotizaciones.length > 0 && (
            <ListCotizaciones
              cotizaciones={cotizaciones}
              perPage={perPage}
              onPageChange={handlePageChange}
              onNumRegChange={handleNumRegChange}
              onGestion={handleGestion}
              totalProductos={totalProductos}
              pageActual={pageActual}
              totalPaginas={totalPaginas}
            />
          )}
        </div>
      </div>

      {showCotizacion && cotizacionSeleccionada && (
        <GetCotizacion
          open={showCotizacion}
          cotizacion={cotizacionSeleccionada}
          onClose={handleCloseModal}
        />
      )}
    </Container>
  );
};

export default GestionCotizaciones;