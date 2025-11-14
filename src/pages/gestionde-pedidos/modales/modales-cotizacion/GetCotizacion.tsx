import React from 'react';
import { X, Package, User, MapPin, Phone, Mail, AlertTriangle } from 'lucide-react';

interface Cotizacion {
  idCotizacion: string;
  cliente?: {
    nombre1?: string;
    nombre2?: string;
    apellido1?: string;
    apellido2?: string;
    direccion?: string;
    celular?: string;
    email?: string;
  };
  subtotal?: number;
  detalles?: {
    cantidad: number;
    valorUnitario: number;
    producto?: {
      caracteristicas?: string;
      marca?: { nombre?: string };
      medida?: { valor?: number; unidadMedida?: string };
      cantidadDistribucionesAceptadas?: number;
      ultimoHistorialPrecio?: { valorCompra?: string; ValorVenta?: string };
      valorVenta?: number;
    };
  }[];
}

interface GetCotizacionProps {
  open: boolean;
  cotizacion: Cotizacion | null;
  onClose: () => void;
}

const GetCotizacion: React.FC<GetCotizacionProps> = ({ open, cotizacion, onClose }) => {
  if (!open || !cotizacion) return null;

  const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-6 h-6 flex items-center justify-center text-neutral-700 dark:text-neutral-200">{children}</div>
  );

  const getTotalPeso = () =>
    cotizacion.detalles?.reduce((total, item) => {
      const unidad = item.producto?.medida?.unidadMedida?.toLowerCase() || '';
      const esKg = ['kg', 'kilogramo', 'kilogramos'].includes(unidad);
      if (esKg) return total + (parseFloat(item.producto?.medida?.valor?.toString() || '0') * item.cantidad);
      return total;
    }, 0) || 0;

  const getTotalGanancia = () =>
    cotizacion.detalles?.reduce((total, item) => {
      const valorCompra = parseFloat(item.producto?.ultimoHistorialPrecio?.valorCompra || '0');
      const valorVenta = parseFloat(item.producto?.ultimoHistorialPrecio?.ValorVenta || '0');
      return total + (valorVenta - valorCompra) * item.cantidad;
    }, 0) || 0;

  const getTotalVenta = () =>
    cotizacion.detalles?.reduce((total, item) => total + item.cantidad * (item.producto?.valorVenta || 0), 0) || 0;

  const getProductosConStockInsuficiente = () =>
    cotizacion.detalles?.filter(item => (item.producto?.cantidadDistribucionesAceptadas || 0) < item.cantidad) || [];

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 relative border border-neutral-300 dark:border-neutral-700"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 p-1 rounded-full text-neutral-700 dark:text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-5 flex items-center gap-3">
          <IconWrapper><Package className="w-6 h-6" /></IconWrapper>
          Cotización #{cotizacion.idCotizacion}
        </h2>

        <div className="space-y-3 mb-6">
          <p className="flex items-center gap-2"><IconWrapper><User /></IconWrapper><strong>Cliente:</strong> {`${cotizacion.cliente?.nombre1 || ''} ${cotizacion.cliente?.nombre2 || ''} ${cotizacion.cliente?.apellido1 || ''} ${cotizacion.cliente?.apellido2 || ''}`}</p>
          <p className="flex items-center gap-2"><IconWrapper><MapPin /></IconWrapper><strong>Dirección:</strong> {cotizacion.cliente?.direccion || 'No disponible'}</p>
          <p className="flex items-center gap-2"><IconWrapper><Phone /></IconWrapper><strong>Teléfono:</strong> {cotizacion.cliente?.celular || 'No disponible'}</p>
          <p className="flex items-center gap-2"><IconWrapper><Mail /></IconWrapper><strong>Correo:</strong> {cotizacion.cliente?.email || 'No disponible'}</p>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <table className="table-auto w-full border border-neutral-300 dark:border-neutral-700">
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
              <tr className="text-center">
                <th className="px-3 py-2">Producto</th>
                <th className="px-3 py-2">Marca</th>
                <th className="px-3 py-2">Medida</th>
                <th className="px-3 py-2">Cantidad</th>
                <th className="px-3 py-2">Precio Unitario</th>
                <th className="px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {cotizacion.detalles?.map((item, idx) => (
                <tr key={idx} className="text-center even:bg-neutral-50 dark:even:bg-neutral-900 odd:bg-white dark:odd:bg-neutral-800">
                  <td>{item.producto?.caracteristicas}</td>
                  <td>{item.producto?.marca?.nombre}</td>
                  <td>{item.producto?.medida?.valor} {item.producto?.medida?.unidadMedida}</td>
                  <td>{item.cantidad}</td>
                  <td>{item.valorUnitario.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                  <td>{(item.cantidad * item.valorUnitario).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-bold text-right bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
              <tr>
                <td colSpan={5} className="text-right px-2 py-2">Total Peso:</td>
                <td className="px-2 py-2">{getTotalPeso()} kg</td>
              </tr>
              <tr>
                <td colSpan={5} className="text-right px-2 py-2">Ganancia Total:</td>
                <td className="px-2 py-2">{getTotalGanancia().toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
              </tr>
              <tr>
                <td colSpan={5} className="text-right px-2 py-2">Total Venta:</td>
                <td className="px-2 py-2">{getTotalVenta().toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {getProductosConStockInsuficiente().length > 0 && (
          <div className="mt-6 space-y-2">
            {getProductosConStockInsuficiente().map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-400 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <span>
                  El producto <strong>{item.producto?.caracteristicas}</strong> requiere <strong>{item.cantidad}</strong> unidades, pero solo hay <strong>{item.producto?.cantidadDistribucionesAceptadas || 0}</strong> en stock.
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetCotizacion;