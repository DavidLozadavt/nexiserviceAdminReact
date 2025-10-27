import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InfoPuntoVenta from './InfoPuntoVenta';
import AbrirCajaModal from './AbrirCajaModal';
import MenuPuntosDeVentas from './caja/MenuPuntoDeVenta'; // 👈 Importamos el menú
import { useEmpresaThemeContext } from '../../colores/EmpresaThemeProvider';

interface Props {
  sede: any;
  onBack: () => void;
}

const PuntosSede: React.FC<Props> = ({ sede, onBack }) => {
  const { styles } = useEmpresaThemeContext();
  const [puntos, setPuntos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInfo, setSelectedInfo] = useState<any | null>(null);
  const [selectedPuntoVentaId, setSelectedPuntoVentaId] = useState<number | null>(null);

  // 👇 nuevos estados
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [puntoActivo, setPuntoActivo] = useState<any | null>(null);

  useEffect(() => {
    const fetchPuntos = async () => {
      try {
        const res = await axios.get(`get_point_sales_by_sede/${sede.id}`);
        setPuntos(res.data);
      } catch (error) {
        console.error('Error al cargar puntos de venta:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPuntos();
  }, [sede]);

  // 🔁 Si el usuario abre una caja, mostramos el menú
  const handleAbrirCaja = async (data: { observacion: string; excedente: number }) => {
    try {
      await axios.post(`abrir-caja/${selectedPuntoVentaId}`, data);

      const punto = puntos.find((p) => p.id === selectedPuntoVentaId);
      setPuntoActivo(punto);
      setMostrarMenu(true);
    } catch (error) {
      console.error('Error al abrir caja:', error);
    }
  };

  // 🔙 Si está en menú, lo mostramos directamente
  if (mostrarMenu && puntoActivo) {
    return (
      <MenuPuntosDeVentas
        punto={puntoActivo}
        onBack={() => {
          setMostrarMenu(false);
          setPuntoActivo(null);
          setSelectedPuntoVentaId(null);
        }}
      />
    );
  }

  // 🔙 Si está viendo la info del punto
  if (selectedInfo) {
    return <InfoPuntoVenta punto={selectedInfo} onBack={() => setSelectedInfo(null)} />;
  }

  // 🔄 Vista principal
  return (
    <div className="w-full py-10 select-none px-6 min-h-screen transition-colors duration-300">
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${styles.text}`}>
          Sede: {sede.nombreSede}
        </h2>
        <button
          onClick={onBack}
          className={`${styles.primary} ${styles.primaryHover} text-white px-5 py-2.5 rounded-2xl font-semibold transition-all active:scale-95 ${styles.shadow}`}
        >
          ← Volver
        </button>
      </div>

      {/* CONTENIDO */}
      {loading ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400 animate-pulse">
          Cargando puntos de venta...
        </p>
      ) : puntos.length === 0 ? (
        <div className="text-center text-yellow-500 dark:text-yellow-400 font-medium">
          No hay puntos de venta disponibles para esta sede.
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto 
          overflow-y-auto scrollbar-thin scrollbar-thumb-orange-600/70 scrollbar-track-transparent p-2"
          style={{ maxHeight: '75vh' }}
        >
          {puntos.map((pVenta) => {
            const ultimaCaja = pVenta.cajas?.[0];
            const isOpen = ultimaCaja?.estado?.estado.toLowerCase() === 'abierto';
            const usuario = ultimaCaja?.usuario?.persona;

            return (
              <div
                key={pVenta.id}
                className={`${styles.card} ${styles.shadow} ${styles.cardHover} rounded-3xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col border border-neutral-200 dark:border-neutral-800`}
              >
                <div className="w-full h-44 overflow-hidden">
                  <img
                    src={pVenta.imagenUrl || 'assets/img/hombre.png'}
                    alt={pVenta.nombre}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>

                <div className="p-5 flex flex-col gap-2">
                  <h3 className={`text-xl font-bold ${styles.text}`}>{pVenta.nombre}</h3>

                  {isOpen && usuario && (
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      Cajero: {usuario.nombre1} {usuario.apellido1}
                    </p>
                  )}

                  <p
                    className={`text-sm font-medium ${
                      isOpen
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    Estado: {isOpen ? 'Abierto' : 'Cerrado'}
                  </p>

                  <div className="mt-4 flex justify-between gap-3">
                    <button
                      className={`${styles.button} py-2.5 px-4 text-base rounded-2xl font-medium transition active:scale-95`}
                      onClick={() => {
                        if (isOpen) {
                          // Si ya está abierta, entra directo al menú
                          setPuntoActivo(pVenta);
                          setMostrarMenu(true);
                        } else {
                          setSelectedPuntoVentaId(pVenta.id);
                        }
                      }}
                    >
                      {isOpen ? 'Ir a Caja' : 'Abrir Caja'}
                    </button>

                    <button
                      className={`${styles.buttonSelect} py-2.5 px-4 text-base rounded-2xl font-medium transition active:scale-95`}
                      onClick={() => setSelectedInfo(pVenta)}
                    >
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
          onAbrirCaja={handleAbrirCaja}
        />
      )}
    </div>
  );
};

export default PuntosSede;
