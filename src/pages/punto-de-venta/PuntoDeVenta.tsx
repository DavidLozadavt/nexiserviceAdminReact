import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Building2, MapPin, Mail, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
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

  // Scroll táctil
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
    <div className="relative w-full py-12 transition-colors duration-300">
      {/* Título */}
      <div className="text-left mb-10 ml-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl sm:text-4xl font-semibold text-neutral-950 dark:text-neutral-50">
            Selecciona la sede
          </h2>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Elige una sede para gestionar sus puntos de venta
        </p>
      </div>

      {/* Botón scroll izquierdo */}
      {!isCentered && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center
                     w-11 h-11 rounded-full bg-white/90 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700
                     text-neutral-700 dark:text-neutral-100 shadow-md transition"
        >
          <ArrowLeftCircle className="w-6 h-6" />
        </button>
      )}

      {/* Contenedor de sedes */}
      <div className="relative max-w-7xl mx-auto px-10">
        <div
          ref={scrollRef}
          className={`flex flex-wrap justify-center md:justify-center gap-6 pb-6 transition-all duration-300`}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[70%] sm:w-[40%] md:w-[30%] lg:w-[22%] h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-950  animate-pulse flex-shrink-0"
                />
              ))
            : sedes.map((sede) => (
                <div
                  key={sede.id}
                  onClick={() => setSelectedSede(sede)}
                  className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700
                             hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]
                             hover:-translate-y-1 transition-transform duration-300
                             w-[70%] sm:w-[40%] md:w-[30%] lg:w-[22%] rounded-2xl overflow-hidden cursor-pointer"
                >
                  <div className="overflow-hidden">
                    <img
                      src={sede.urlSede}
                      alt={sede.nombreSede}
                      className="w-full aspect-[4/3] object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      {sede.nombreSede}
                    </h3>
                    <p className="text-sm text-neutral-700 dark:text-neutral-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      {sede.direccion}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-500 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-red-500" />
                      {sede.email}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Botón scroll derecho */}
      {!isCentered && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center
                     w-11 h-11 rounded-full bg-white/90 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700
                     text-neutral-700 dark:text-neutral-100 shadow-md transition"
        >
          <ArrowRightCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default PuntoVentas;
