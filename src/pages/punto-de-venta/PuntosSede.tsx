import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeftCircle, Monitor, User, LogIn, Info } from 'lucide-react';
import InfoPuntoVenta from './InfoPuntoVenta';
import AbrirCajaModal from './caja/AbrirCajaModal';
import MenuPuntosDeVentas from './caja/MenuPuntoDeVenta';

interface Props {
  sede: any;
  onBack: () => void;
}

interface Caja {
  id: number;
  estado: { estado: string };
  usuario?: { persona?: { nombre1: string; apellido1: string } };
  observacion?: string;
  exedente?: number;
}

interface PuntoVenta {
  id: number;
  nombre: string;
  imagenUrl?: string;
  cajas: Caja[];
}

const PuntosSede: React.FC<Props> = ({ sede, onBack }) => {
  const [puntos, setPuntos] = useState<PuntoVenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInfo, setSelectedInfo] = useState<PuntoVenta | null>(null);
  const [selectedPuntoVentaId, setSelectedPuntoVentaId] = useState<number | null>(null);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [puntoActivo, setPuntoActivo] = useState<PuntoVenta | null>(null);

  useEffect(() => {
    const fetchPuntos = async () => {
      try {
        const res = await axios.get(`get_point_sales_by_sede/${sede.id}`);
        setPuntos(res.data.map((p: any) => ({ ...p, cajas: p.cajas || [] })));
      } catch (error) {
        console.error('Error al cargar puntos de venta:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPuntos();
  }, [sede]);

  // 🔥 función para actualizar el estado de la caja cuando se cierre
  const actualizarCajaCerrada = (idPuntoVenta: number) => {
    setPuntos((prev) =>
      prev.map((p) =>
        p.id === idPuntoVenta
          ? {
              ...p,
              cajas: [{ ...p.cajas[0], estado: { estado: 'cerrado' } }, ...p.cajas.slice(1)]
            }
          : p
      )
    );
  };

  if (mostrarMenu && puntoActivo) {
    return (
      <MenuPuntosDeVentas
        punto={puntoActivo}
        onBack={() => {
          setMostrarMenu(false);
          setPuntoActivo(null);
          setSelectedPuntoVentaId(null);
        }}
        actualizarCajaCerrada={actualizarCajaCerrada} // 🔥 pasamos callback
      />
    );
  }

  if (selectedInfo) {
    return <InfoPuntoVenta punto={selectedInfo} onBack={() => setSelectedInfo(null)} />;
  }

  return (
    <div className="relative w-[95%] max-w-7xl mx-auto my-12 px-6 py-10 transition-colors duration-300">
      {/* ENCABEZADO */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 drop-shadow-sm">
          Sede: {sede.nombreSede}
        </h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white 
                     bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
        >
          <ArrowLeftCircle className="w-5 h-5" />
          Volver
        </button>
      </div>

      {/* CONTENIDO */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-neutral-500 dark:text-neutral-400">Cargando puntos de venta...</p>
        </div>
      ) : puntos.length === 0 ? (
        <div className="text-center bg-yellow-100 text-yellow-800 px-4 py-3 rounded-xl font-medium">
          No hay puntos de venta disponibles para esta sede.
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {puntos.map((pVenta) => {
            const ultimaCaja = pVenta.cajas[0];
            const isOpen = ultimaCaja?.estado?.estado?.toLowerCase() === 'abierto';
            const usuario = ultimaCaja?.usuario?.persona;

            return (
              <div
                key={pVenta.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700
                           rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                           overflow-hidden flex flex-col h-[400px]"
              >
                <div className="h-52 overflow-hidden rounded-t-3xl">
                  <img
                    src={pVenta.imagenUrl || '/media/avatars/blank.png'}
                    alt={pVenta.nombre}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2 flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      {pVenta.nombre}
                    </h3>

                    {isOpen && usuario && (
                      <p className="text-sm text-neutral-700 dark:text-neutral-400 mb-1 flex items-center gap-2">
                        <User className="w-4 h-4 text-green-500" />
                        <strong>Cajero:</strong> {usuario.nombre1} {usuario.apellido1}
                      </p>
                    )}

                    <p
                      className={`font-semibold mb-2 flex items-center gap-2 ${
                        isOpen
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-500 dark:text-red-400'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                      Estado: {isOpen ? 'Abierto' : 'Cerrado'}
                    </p>

                    {ultimaCaja?.observacion && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        <strong>Observación:</strong>{' '}
                        {ultimaCaja.observacion.length > 60
                          ? `${ultimaCaja.observacion.slice(0, 60)}...`
                          : ultimaCaja.observacion}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white font-semibold
                        ${isOpen ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} transition-all duration-200`}
                      onClick={() => {
                        if (isOpen) {
                          setPuntoActivo(pVenta);
                          setMostrarMenu(true);
                        } else {
                          setSelectedPuntoVentaId(pVenta.id); // abrir modal
                        }
                      }}
                    >
                      <LogIn className="w-4 h-4" />
                      {isOpen ? 'Ir a Caja' : 'Abrir Caja'}
                    </button>

                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                                 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200
                                 hover:bg-gray-300 dark:hover:bg-gray-700 font-semibold transition-all duration-200"
                      onClick={() => setSelectedInfo(pVenta)}
                    >
                      <Info className="w-4 h-4" />
                      Ver Info
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL ABRIR CAJA */}
      {selectedPuntoVentaId && !mostrarMenu && (
        <AbrirCajaModal
          idPuntoDeVenta={selectedPuntoVentaId}
          onClose={() => setSelectedPuntoVentaId(null)}
          onAbrirCaja={(data) => {
            const nuevaCaja: Caja = {
              id: Date.now(),
              estado: { estado: 'abierto' },
              observacion: data.observacion,
              exedente: data.excedente
            };
            setPuntos((prev) =>
              prev.map((p) =>
                p.id === selectedPuntoVentaId ? { ...p, cajas: [nuevaCaja, ...p.cajas] } : p
              )
            );
            setPuntoActivo(puntos.find((p) => p.id === selectedPuntoVentaId) || null);
            setMostrarMenu(true);
            setSelectedPuntoVentaId(null);
          }}
        />
      )}
    </div>
  );
};

export default PuntosSede;
