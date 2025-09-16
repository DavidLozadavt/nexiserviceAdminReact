import { ProductoItem } from "../models/ProductoModel";
import { ShoppingCart } from "lucide-react"; 

interface Props {
  item: ProductoItem;
  onAgregar: (item: ProductoItem) => void;
}

const ProductoCard = ({ item, onAgregar }: Props) => {
  const producto = item.producto;
  const precio = producto.ultimoHistorialPrecio?.ValorVenta ?? producto.valorVenta;
  const puedeAgregar = !!precio;

  return (
    <div className="flex flex-col justify-between p-3 text-center transition-shadow duration-200 border shadow-sm rounded-2xl hover:shadow-md h-70">
      {/* Imagen cuadrada */}
      <div className="w-full aspect-square">
        <img
          src={producto.rutaProductoUrl}
          alt={producto.modelo}
          className="object-cover w-full h-full rounded-xl"
        />
      </div>

      {/* Info */}
      <h3 className="text-sm font-semibold text-gray-800 truncate">
        {producto.modelo}
      </h3>

      <div className="text-xs text-gray-600 mt-1">
        <p>
          <span className="font-medium text-gray-700">Valor:</span>{" "}
          {precio
            ? Number(precio).toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
              })
            : "No configurado"}
        </p>
        <p>
          <span className="font-medium text-gray-700">Cantidad:</span> {item.cantidad}
        </p>
      </div>

      {/* Botón */}
      <button
        disabled={!puedeAgregar}
        onClick={() => onAgregar(item)}
        className={`mt-2 w-full flex items-center justify-center gap-2 py-1.5 rounded-xl font-semibold text-sm transition-colors duration-300 ${
          puedeAgregar
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
        Agregar
      </button>
    </div>
  );
};


export { ProductoCard };
