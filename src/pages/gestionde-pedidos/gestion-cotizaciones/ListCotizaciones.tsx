import React from 'react';
import { KeenIcon } from '@/components';

interface Cotizacion {
  idCotizacion: string;
  cliente: {
    nombre1?: string;
    apellido1?: string;
  };
  fecha?: string;
  subtotal?: number;
  totalProductos?: number;
  estado?: string;
}

interface ListCotizacionesProps {
  cotizaciones: Cotizacion[];
  perPage: number;
  onPageChange: (page: number) => void;
  onNumRegChange: (num: number) => void;
  onGestion: (cotizacion: Cotizacion) => void;
  totalProductos: number;
  pageActual: number;
  totalPaginas: number;
}

const ListCotizaciones: React.FC<ListCotizacionesProps> = ({
  cotizaciones,
  perPage,
  onPageChange,
  onNumRegChange,
  onGestion,
  totalProductos,
  pageActual,
  totalPaginas,
}) => {
  const handleNumRegChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onNumRegChange(parseInt(e.target.value, 10));
  };

  const handlePagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      onPageChange(pagina);
    }
  };

  const obtenerPaginas = () => Array.from({ length: totalPaginas }, (_, i) => i + 1);

  console.log("Cotizaciones:", cotizaciones);

  return (
    <div className="table-responsive mb-3">
      <table className="table table-bordered table-hover text-center">
        <thead>
          <tr className="table-info text-center">
            <th>Número de Cotización</th>
            <th>Cliente</th>
            <th>Fecha de Cotización</th>
            <th>Cantidad de Productos</th>
            <th>Subtotal</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map((c) => (
            <tr key={c.idCotizacion}>
              <td>{c.idCotizacion}</td>
              <td>{c.cliente?.nombre1} {c.cliente?.apellido1}</td>
              <td>
                {c.fecha
                  ? new Date(c.fecha).toLocaleString('es-CO', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })
                  : ''}
              </td>
              <td>{c.totalProductos}</td>
              <td>{c.subtotal?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
              <td>{c.estado}</td>
              <td>
                <button 
                  className="btn btn-sm btn-light-primary" 
                  onClick={() => onGestion(c)}>
                  <KeenIcon icon="eye" /> 
                  Ver cotización
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <div className="d-flex align-items-center gap-2">
          <span>Mostrando</span>
          <select className="form-control" style={{ width: 'auto' }} onChange={handleNumRegChange} value={perPage}>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
          </select>
          <span>por página</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span>Mostrando {cotizaciones.length} de {totalProductos} cotizaciones</span>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-secondary" onClick={() => handlePagina(pageActual - 1)} disabled={pageActual === 1}>
              &lt;
            </button>
            {obtenerPaginas().map((pagina) => (
              <button key={pagina} className={`btn ${pagina === pageActual ? 'btn-primary' : 'btn-light'}`} onClick={() => handlePagina(pagina)}>
                {pagina}
              </button>
            ))}
            <button className="btn btn-secondary" onClick={() => handlePagina(pageActual + 1)} disabled={pageActual >= totalPaginas}>
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListCotizaciones;