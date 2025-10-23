import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import PuntosSede from './PuntosSede';
import { useEmpresaThemeContext } from '../../colores/EmpresaThemeProvider';

const PuntoVentas: React.FC = () => {
  const { styles } = useEmpresaThemeContext(); // 🔥 tema activo
  const [sedes, setSedes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSede, setSelectedSede] = useState<any | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await axios.get('sedes');
        setSedes(response.data);
      } catch (error) {
        console.error('Error al cargar sedes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSedes();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollTo =
      direction === 'left' ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
    scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
  };

  const isCentered = !loading && sedes.length <= 2;

  // Touch scroll horizontal
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let startX = 0;
    let scrollLeftPos = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].pageX;
      scrollLeftPos = container.scrollLeft;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0].pageX - startX;
      if (Math.abs(deltaX) > 0) {
        container.scrollLeft = scrollLeftPos - deltaX;
        e.preventDefault();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  if (selectedSede) {
    return <PuntosSede sede={selectedSede} onBack={() => setSelectedSede(null)} />;
  }

  return (
    <div className="relative w-full py-12 select-none">
      <h2 className={`text-3xl sm:text-4xl font-extrabold text-left mb-10 px-6 ${styles.text}`}>
        Selecciona la sede
      </h2>

      {/* Botón scroll izquierdo */}
      {!isCentered && (
        <button
          onClick={() => scroll('left')}
          className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full z-20 hidden md:flex items-center justify-center
            ${styles.primary} ${styles.primaryHover} text-white ${styles.shadow} ${styles.shadowHover} transition`}
        >
          ❮
        </button>
      )}

      {/* Contenedor de sedes */}
      <div className="relative max-w-7xl mx-auto">
        <div
          ref={scrollRef}
          className={`scroll-hide flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth px-4 sm:px-6 pb-6 snap-x snap-mandatory touch-pan-x min-h-[340px] ${
            isCentered ? 'justify-center' : ''
          }`}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[70%] sm:w-[40%] md:w-[30%] lg:w-[22%] h-64 ${styles.card} ${styles.shadow} animate-pulse flex-shrink-0 snap-start rounded-3xl`}
                />
              ))
            : sedes.map((sede) => (
                <div
                  key={sede.id}
                  onClick={() => setSelectedSede(sede)}
                  className={`cursor-pointer w-[70%] sm:w-[40%] md:w-[30%] lg:w-[22%] ${styles.card} ${styles.shadow} ${styles.cardHover} flex-shrink-0 snap-start rounded-3xl overflow-hidden transform active:scale-95 transition-all duration-300`}
                >
                  <img
                    src={sede.urlSede}
                    alt={sede.nombreSede}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="p-4 sm:p-6">
                    <h3 className={`text-xl sm:text-2xl font-bold mb-1 ${styles.text}`}>
                      {sede.nombreSede}
                    </h3>
                    <p className={`text-sm ${styles.text}`}>Dirección: {sede.direccion}</p>
                    <p className={`text-xs mt-1 ${styles.text}`}>Correo: {sede.email}</p>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Botón scroll derecho */}
      {!isCentered && (
        <button
          onClick={() => scroll('right')}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full z-20 hidden md:flex items-center justify-center
            ${styles.primary} ${styles.primaryHover} text-white ${styles.shadow} ${styles.shadowHover} transition`}
        >
          ❯
        </button>
      )}

      {/* Scroll hide */}
      <style>
        {`
          .scroll-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scroll-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default PuntoVentas;
