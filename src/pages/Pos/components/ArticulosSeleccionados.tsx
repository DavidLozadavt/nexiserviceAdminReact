import { useEffect, useState } from 'react';
import { ItemSeleccionado, ProductoItem } from '../models/ProductoModel';
import { Container } from '@/components';
import PagoModal from './PagoModal';
import ModalVentasPendientes from './ModalVentasPendientes';
import { Cliente } from '../models/ClienteModel';

interface Props {
  articulos: ItemSeleccionado[];
  eliminarArticulo: (id: number) => void;
  actualizarCantidad: (id: number, cantidad: number) => void;
  cliente: Cliente | null;
  idPunto?: number;
  idShoppingCart: number | null;
  onPagoExitoso: () => void;
}

const ArticulosSeleccionados = ({
  articulos,
  eliminarArticulo,
  actualizarCantidad,
  cliente,
  idPunto,
  idShoppingCart,
  onPagoExitoso
}: Props) => {
  const [aplicarIVA, setAplicarIVA] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [showModalPago, setShowModalPago] = useState(false);
  const [showVentasPendientes, setShowVentasPendientes] = useState(false);
  const articulosPorPagina = 4;

  const handleModalPagoClose = () => {
    setShowModalPago(false);
  };
  const handleTipoPagoModalOpen = () => {
    setShowModalPago(true);
  };

  const handleVentasPendientesOpen = () => {
    setShowVentasPendientes(true);
  };
  const handleVentasPendientesClose = () => {
    setShowVentasPendientes(false);
  };
  const totalSinIVA = articulos.reduce((total, item) => {
    if (item.tipo === 'producto') {
      return total + item.producto.producto.valorVenta * item.cantidad;
    } else {
      return total + item.valorUnitario * item.cantidad;
    }
  }, 0);

  const IVA = aplicarIVA ? totalSinIVA * 0.19 : 0;
  const totalConIVA = totalSinIVA + IVA;

  const indiceInicio = (paginaActual - 1) * articulosPorPagina;
  const indiceFin = indiceInicio + articulosPorPagina;
  const articulosPaginados = articulos.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(articulos.length / articulosPorPagina);
  useEffect(() => {
    const totalPaginas = Math.ceil(articulos.length / articulosPorPagina);
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas);
    }
  }, [articulos, paginaActual]);

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Artículos Seleccionados</h3>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <span>Aplicar IVA (19%)</span>
          <input
            type="checkbox"
            checked={aplicarIVA}
            onChange={() => setAplicarIVA(!aplicarIVA)}
            className="sr-only"
          />
          <div
            className={`w-7 h-4 flex items-center rounded-full p-0.5 duration-300 ease-in-out ${aplicarIVA ? 'bg-green-500' : 'bg-gray-300'
              }`}
          >
            <div
              className={`bg-white w-3.5 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${aplicarIVA ? 'translate-x-2.5' : ''
                }`}
            />
          </div>
        </label>
      </div>

      {articulos.length === 0 ? (
        <div className="mb-4 text-sm text-gray-500">No se han agregado productos ni servicios.</div>
      ) : (
        <>
          <table className="w-full mb-4 text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Nombre</th>
                <th className="p-2 border">Valor Unitario</th>
                <th className="p-2 border">Cantidad</th>
                <th className="p-2 border">Subtotal</th>
                <th className="p-2 border">Acción</th>
              </tr>
            </thead>
            <tbody>
              {articulosPaginados.map((item) => {
                const id = item.tipo === 'producto' ? item.producto.id : item.id;
                const nombre =
                  item.tipo === 'producto' ? item.producto.producto.modelo : item.nombre;
                const valorUnitario =
                  item.tipo === 'producto' ? item.producto.producto.valorVenta : item.valorUnitario;
                const subtotal = valorUnitario * item.cantidad;

                return (
                  <tr key={`${item.tipo}-${id}`}>
                    <td className="p-2 border">{nombre}</td>
                    <td className="p-2 border">
                      {valorUnitario.toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP'
                      })}
                    </td>
                    <td className="p-2 border">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => actualizarCantidad(id, Math.max(1, item.cantidad - 1))}
                          className="px-2 py-1 text-white bg-gray-500 rounded"
                        >
                          -
                        </button>
                        <span>{item.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidad(id, item.cantidad + 1)}
                          className="px-2 py-1 text-white bg-gray-500 rounded"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-2 border">
                      {subtotal.toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP'
                      })}
                    </td>
                    <td className="p-2 text-center border">
                      <button
                        onClick={() => eliminarArticulo(id)}
                        className="px-2 py-1 text-white bg-red-500 rounded"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPaginas > 1 && (
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                disabled={paginaActual === 1}
                className="px-2 py-1 text-sm text-white bg-gray-500 rounded disabled:opacity-50"
              >
                ⬅️ Anterior
              </button>
              <span className="self-center text-sm">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-2 py-1 text-sm text-white bg-gray-500 rounded disabled:opacity-50"
              >
                Siguiente ➡️
              </button>
            </div>
          )}

          <div className="mb-4 space-y-1 text-sm text-right">
            <div>
              <strong>Total sin IVA:</strong>{' '}
              {totalSinIVA.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP'
              })}
            </div>
            <div>
              <strong>IVA (19%):</strong>{' '}
              {IVA.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP'
              })}
            </div>
            <div>
              <strong>Total con IVA:</strong>{' '}
              {totalConIVA.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP'
              })}
            </div>
          </div>
        </>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleTipoPagoModalOpen}
          disabled={articulos.length === 0}
          className={`flex-1 px-3 py-1.5 text-sm text-white rounded 
                ${articulos.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
        >
          💳 Pagar {totalConIVA.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
        </button>

        <button className="flex-1 px-3 py-1.5 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">
          🛒 Nueva compra
        </button>
      </div>

      <button
        disabled={articulos.length === 0}
        onClick={handleVentasPendientesOpen}
        className={`w-full px-4 py-2 mb-2 rounded text-white 
        ${articulos.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        🛒 Ventas Pendientes ({articulos.length})
      </button>

      <button className="w-full px-4 py-2 text-white rounded bg-cyan-600 hover:bg-cyan-700">
        🖋️ Registrar Gastos
      </button>
      <Container>
      <PagoModal
          cliente={cliente}
          open={showModalPago}
          onClose={handleModalPagoClose}
          montoTotal={totalConIVA}
          idPunto={idPunto}
          idShoppingCart={idShoppingCart}
          onSuccess={onPagoExitoso} 
        />

        <ModalVentasPendientes open={showVentasPendientes} onClose={handleVentasPendientesClose} />
      </Container>
    </div>
  );
};

export { ArticulosSeleccionados };
