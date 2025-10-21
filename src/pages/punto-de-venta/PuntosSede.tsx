import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
  sede: any;
  onBack: () => void;
}

const PuntosSede: React.FC<Props> = ({ sede, onBack }) => {
  const [puntos, setPuntos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-orange-500 dark:text-orange-400">
          Sede: {sede.nombreSede}
        </h2>
        <button
          onClick={onBack}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-2xl font-semibold transition"
        >
          ← Volver
        </button>
      </div>

      {loading ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400">
          Cargando puntos de venta...
        </p>
      ) : puntos.length === 0 ? (
        <div className="text-center text-yellow-400 font-medium">
          No hay puntos de venta disponibles para esta sede.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {puntos.map((pVenta) => {
            const isOpen =
              pVenta.cajas?.length > 0 &&
              pVenta.cajas[0].estado?.estado.toLowerCase() === 'abierto';
            const usuario = pVenta.cajas?.[0]?.usuario?.persona;

            return (
              <div
                key={pVenta.id}
                className="bg-neutral-300/5 dark:bg-neutral-950 rounded-3xl shadow-xl hover:shadow-orange-500/50 transition transform active:scale-95 flex flex-col"
              >
                {/* Imagen del punto */}
                <div className="w-full h-48 overflow-hidden rounded-t-3xl">
                  <img
                    src={pVenta.imagenUrl || 'assets/img/hombre.png'}
                    alt={pVenta.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Contenido */}
                <div className="p-6 flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400">
                    {pVenta.nombre}
                  </h3>

                  {isOpen && usuario && (
                    <p className="text-sm text-neutral-950 dark:text-neutral-50">
                      Cajero: {usuario.nombre1} {usuario.apellido1}
                    </p>
                  )}

                  <p
                    className={`text-sm font-medium ${isOpen ? 'text-green-500' : 'text-red-400'}`}
                  >
                    Estado: {isOpen ? 'Abierto' : 'Cerrado'}
                  </p>

                  {/* Botones lado a lado */}
                  <div className="mt-4 flex justify-between gap-4">
                    <button
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-2xl transition"
                      onClick={() => console.log('abrirCaja', pVenta)}
                    >
                      {isOpen ? 'Ir a Caja' : 'Abrir'}
                    </button>
                    <button
                      className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-2xl transition"
                      onClick={() => console.log('verMasInfo', pVenta.id)}
                    >
                      Info
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PuntosSede;
