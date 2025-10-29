import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CerrarCajaModal from './CerrarCajaModal';

interface Props {
  punto: any;
  onBack: () => void;
  actualizarCajaCerrada?: (idPuntoVenta: number) => void; // 🔥 nueva prop
}

type Filtro = 'productos' | 'servicios' | 'articulos';

const MenuPuntosDeVentas: React.FC<Props> = ({ punto, onBack, actualizarCajaCerrada }) => {
  const [productos, setProductos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [articulos, setArticulos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('productos');
  const [showCerrarCajaModal, setShowCerrarCajaModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resServ, resArt] = await Promise.all([
          axios.get(`get_productos_punto_venta_menu/${punto.id}`),
          axios.get(`get_all_services`),
          axios.get(`tipo_articulos`)
        ]);
        setProductos(resProd.data);
        setServicios(resServ.data);
        setArticulos(resArt.data);
      } catch (error: any) {
        const msg = error.response?.data?.message;
        if (
          msg ===
          'No puedes abrir una nueva caja. Ya tienes una caja abierta en otro punto de venta.'
        ) {
          setErrorMessage(msg);
          setShowErrorModal(true);
        } else {
          console.error('Error al cargar datos del menú:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [punto]);

  const items = filtro === 'productos' ? productos : filtro === 'servicios' ? servicios : articulos;

  return (
    <div className="w-full min-h-screen py-10 px-6 bg-gray-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-100">
      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 max-w-7xl mx-auto gap-4">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          {punto.nombre} — Menú de Punto de Venta
        </h2>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
          >
            ← Volver
          </button>

          <button
            onClick={() => setShowCerrarCajaModal(true)}
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
          >
            Cerrar Caja
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {(['productos', 'servicios', 'articulos'] as const).map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              filtro === tipo
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700'
            }`}
          >
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 animate-pulse">
          Cargando {filtro}...
        </p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No hay {filtro} disponibles para este punto de venta.
        </p>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto overflow-y-auto p-2"
          style={{ maxHeight: '75vh' }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-lg transition-transform duration-200 hover:-translate-y-1 flex flex-col"
            >
              <div className="w-full h-44 overflow-hidden rounded-t-xl">
                <img
                  src={item.urlImagen || 'assets/img/default-product.jpg'}
                  alt={item.nombre}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{item.nombre}</h3>
                  {filtro === 'productos' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Precio: ${item.precio || 0}
                    </p>
                  )}
                  {filtro === 'servicios' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Duración: {item.duracion || '—'}
                    </p>
                  )}
                  {filtro === 'articulos' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Tipo: {item.tipo || '—'}
                    </p>
                  )}
                </div>
                <button className="mt-3 w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition">
                  {filtro === 'productos'
                    ? 'Agregar'
                    : filtro === 'servicios'
                      ? 'Agendar'
                      : 'Ver detalle'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CIERRE DE CAJA */}
      {showCerrarCajaModal && (
        <CerrarCajaModal
          idPuntoDeVenta={punto.id}
          onClose={() => setShowCerrarCajaModal(false)}
          onCajaCerrada={() => {
            if (actualizarCajaCerrada) actualizarCajaCerrada(punto.id); // 🔥 actualiza estado
            setShowCerrarCajaModal(false);
            onBack();
          }}
        />
      )}

      {/* MODAL DE ERROR */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 shadow-xl text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-3">Atención</h2>
            <p className="text-sm mb-6 text-gray-700 dark:text-gray-300">{errorMessage}</p>
            <button
              onClick={() => {
                setShowErrorModal(false);
                onBack();
              }}
              className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPuntosDeVentas;
