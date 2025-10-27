import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useEmpresaThemeContext } from '../../../colores/EmpresaThemeProvider';

interface Props {
  punto: any;
  onBack: () => void;
}

const MenuPuntosDeVentas: React.FC<Props> = ({ punto, onBack }) => {
  const { styles } = useEmpresaThemeContext();

  const [productos, setProductos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [articulos, setArticulos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'productos' | 'servicios' | 'articulos'>('productos');

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
      } catch (error) {
        console.error('Error al cargar datos del menú:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [punto]);

  return (
    <div className="w-full min-h-screen py-10 px-6 select-none transition-colors duration-300">
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${styles.text}`}>
          {punto.nombre} — Menú de Punto de Venta
        </h2>
        <button
          onClick={onBack}
          className={`${styles.primary} ${styles.primaryHover} text-white px-5 py-2.5 rounded-2xl font-semibold transition-all active:scale-95 ${styles.shadow}`}
        >
          ← Volver
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {(['productos', 'servicios', 'articulos'] as const).map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo)}
            className={`px-5 py-2.5 rounded-2xl font-semibold transition-all active:scale-95 ${
              filtro === tipo
                ? `${styles.primary} text-white ${styles.shadow}`
                : `${styles.buttonSelect}`
            }`}
          >
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      {loading ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400 animate-pulse">
          Cargando {filtro}...
        </p>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto 
          overflow-y-auto scrollbar-thin scrollbar-thumb-orange-600/70 scrollbar-track-transparent p-2"
          style={{ maxHeight: '75vh' }}
        >
          {filtro === 'productos' &&
            productos.map((prod) => (
              <div
                key={prod.id}
                className={`${styles.card} ${styles.shadow} ${styles.cardHover} rounded-3xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col`}
              >
                <div className="w-full h-44 overflow-hidden">
                  <img
                    src={prod.urlImagen || 'assets/img/default-product.jpg'}
                    alt={prod.nombre}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <h3 className={`text-lg font-bold ${styles.text}`}>{prod.nombre}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Precio: ${prod.precio || '0'}
                  </p>
                  <button
                    className={`${styles.button} py-2 mt-2 rounded-2xl font-medium transition active:scale-95`}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}

          {filtro === 'servicios' &&
            servicios.map((serv) => (
              <div
                key={serv.id}
                className={`${styles.card} ${styles.shadow} ${styles.cardHover} rounded-3xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col`}
              >
                <div className="w-full h-44 overflow-hidden">
                  <img
                    src={serv.urlImagen || 'assets/img/default-service.jpg'}
                    alt={serv.nombre}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <h3 className={`text-lg font-bold ${styles.text}`}>{serv.nombre}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Duración: {serv.duracion || '—'}
                  </p>
                  <button
                    className={`${styles.button} py-2 mt-2 rounded-2xl font-medium transition active:scale-95`}
                  >
                    Agendar
                  </button>
                </div>
              </div>
            ))}

          {filtro === 'articulos' &&
            articulos.map((art) => (
              <div
                key={art.id}
                className={`${styles.card} ${styles.shadow} ${styles.cardHover} rounded-3xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col`}
              >
                <div className="w-full h-44 overflow-hidden">
                  <img
                    src={art.urlImagen || 'assets/img/default-articulo.jpg'}
                    alt={art.nombre}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <h3 className={`text-lg font-bold ${styles.text}`}>{art.nombre}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Tipo: {art.tipo || '—'}
                  </p>
                  <button
                    className={`${styles.button} py-2 mt-2 rounded-2xl font-medium transition active:scale-95`}
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MenuPuntosDeVentas;
