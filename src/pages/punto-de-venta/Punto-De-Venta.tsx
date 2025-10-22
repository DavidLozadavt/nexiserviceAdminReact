import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import PuntosSede from './PuntosSede';

const PuntoVentas: React.FC = () => {
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

  // Manejo de touch seguro solo para scroll horizontal del contenedor
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
      const deltaY = e.touches[0].pageY - e.touches[0].pageY; // Esto es solo un placeholder

      // Solo prevenir default si el movimiento horizontal es dominante
      if (Math.abs(deltaX) > Math.abs(e.touches[0].clientY - e.touches[0].clientY)) {
        container.scrollLeft = scrollLeftPos - deltaX;
        e.preventDefault(); // Bloquea scroll horizontal pero deja vertical intacto
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
      <h2 className="text-3xl sm:text-4xl font-extrabold text-left mb-10 text-neutral-950 dark:text-slate-50 px-6">
        Selecciona la sede
      </h2>

      {!isCentered && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-orange-600/30 hover:bg-orange-600/70 text-white p-3 rounded-full z-10 hidden md:flex items-center justify-center transition"
        >
          ❮
        </button>
      )}

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
                  className="w-[70%] sm:w-[40%] md:w-[30%] lg:w-[22%] h-64 bg-neutral-800/40 dark:bg-neutral-900/40 rounded-3xl animate-pulse flex-shrink-0 snap-start"
                />
              ))
            : sedes.map((sede) => (
                <div
                  key={sede.id}
                  onClick={() => setSelectedSede(sede)}
                  className="cursor-pointer w-[70%] sm:w-[40%] md:w-[30%] lg:w-[22%] bg-neutral-300/5 dark:bg-neutral-950 rounded-3xl overflow-hidden shadow-xl hover:shadow-orange-500/50 flex-shrink-0 snap-start transform active:scale-95 transition-all duration-300"
                >
                  <img
                    src={sede.urlSede}
                    alt={sede.nombreSede}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-orange-500 mb-1">
                      {sede.nombreSede}
                    </h3>
                    <p className="text-neutral-950 dark:text-neutral-50 text-sm">
                      Dirección: {sede.direccion}
                    </p>
                    <p className="text-neutral-950 dark:text-neutral-50 text-xs mt-1">
                      Correo: {sede.email}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {!isCentered && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-orange-600/30 hover:bg-orange-600/70 text-white p-3 rounded-full z-10 hidden md:flex items-center justify-center transition"
        >
          ❯
        </button>
      )}

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
