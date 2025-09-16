import { useState } from 'react';
import { TabHeader } from './Tabs/TabHeader';
import { ProductosPanel } from './ProductosPanel';
import { ServiciosPanel } from './ServiciosPanel';
import { CatalogoPanel } from './CatalogoPanel';
import { Cliente } from '../models/ClienteModel';
import { ArticulosSeleccionados } from './ArticulosSeleccionados';
import { ItemSeleccionado } from '../models/ProductoModel';
import { ClienteInfo } from './ClienteInfo';
import axios from 'axios';

interface PostContentProps {
  idPunto: any;
}

const PosContent = ({ idPunto }: PostContentProps) => {
  const [activeTab, setActiveTab] = useState('productos');
  const [articulosSeleccionados, setArticulosSeleccionados] = useState<ItemSeleccionado[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [idShoppingCart, setIdShoppingCart] = useState<number | null>(null);
  const [recargarProductos, setRecargarProductos] = useState(false);
  const [recargarClientes, setRecargarClientes] = useState(false);
  const [recargarServicios, setRecargarServicios] = useState(false);

  const handlePagoExitoso = () => {
    setArticulosSeleccionados([]);
    setIdShoppingCart(null);
    setCliente(null);
    setRecargarProductos((prev) => !prev);
    setRecargarClientes((prev) => !prev);
    setRecargarServicios((prev) => !prev);
  };

  const agregarArticulo = (item: ItemSeleccionado) => {
    setArticulosSeleccionados((prev) => {
      const existe = prev.find((a) => {
        if (a.tipo === 'producto' && item.tipo === 'producto') {
          return a.producto.id === item.producto.id;
        }
        if (a.tipo === 'servicio' && item.tipo === 'servicio') {
          return a.id === item.id;
        }
        return false;
      });

      if (existe) {
        return prev.map((a) => {
          if (a.tipo === item.tipo) {
            if (a.tipo === 'producto' && item.tipo === 'producto' && a.producto.id === item.producto.id) {
              return {
                ...a,
                cantidad: a.cantidad + item.cantidad,
                idAsignacion: item.idAsignacion ?? a.idAsignacion 
              };
            }
            if (a.tipo === 'servicio' && item.tipo === 'servicio' && a.id === item.id) {
              return { ...a, cantidad: a.cantidad + item.cantidad };
            }
          }
          return a;
        });
      } else {
        return [...prev, item];
      }
    });
  };

  const eliminarAsignacionCarrito = async (idAsignacion: number) => {
    try {
      await axios.post('/delete_item_shoppingcart_service', {
        idAsignacionCarritoProducto: idAsignacion,
      });
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
    }
  };
  
  const eliminarArticulo = async (id: number) => {
    const itemAEliminar = articulosSeleccionados.find(
      (item) =>
        (item.tipo === 'producto' && item.producto.id === id) ||
        (item.tipo === 'servicio' && item.id === id)
    );
  
    if (itemAEliminar?.idAsignacion) {
      try {
        await axios.post('/delete_item_shoppingcart_service', {
          idAsignacionCarritoProducto: itemAEliminar.idAsignacion,
        });
      } catch (error) {
        console.error('Error al eliminar en backend:', error);
      }
    }
  
    setArticulosSeleccionados((prev) =>
      prev.filter(
        (item) =>
          !(
            (item.tipo === 'producto' && item.producto.id === id) ||
            (item.tipo === 'servicio' && item.id === id)
          )
      )
    );
  };
  
  const aumentarCantidadAsignacion = async (idAsignacion: number) => {
    try {
      await axios.post(`/increase_quantity/${idAsignacion}`);
    } catch (error) {
      console.error('Error al aumentar cantidad en backend:', error);
    }
  };
  const disminuirCantidadAsignacion = async (idAsignacion: number) => {
    try {
      await axios.post(`/decrease_quantity/${idAsignacion}`);
    } catch (error) {
      console.error('Error al disminuir cantidad en backend:', error);
    }
  };
  

  const actualizarCantidad = async (id: number, nuevaCantidad: number) => {
    let cantidadAnterior = 0;
    let idAsignacion: number | undefined;
  
    const itemActual = articulosSeleccionados.find(
      (i) => i.tipo === 'producto' && i.producto.id === id
    );
  
    if (itemActual) {
      cantidadAnterior = itemActual.cantidad;
      idAsignacion = itemActual.idAsignacion;
    }
  
    setArticulosSeleccionados((prev) =>
      prev.map((item) => {
        if (
          (item.tipo === 'producto' && item.producto.id === id) ||
          (item.tipo === 'servicio' && item.id === id)
        ) {
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      })
    );
  
    if (idAsignacion) {
      if (nuevaCantidad > cantidadAnterior) {
        await aumentarCantidadAsignacion(idAsignacion);
      } else if (nuevaCantidad < cantidadAnterior) {
        await disminuirCantidadAsignacion(idAsignacion);
      }
    }
  };
  

  return (
    <div className="px-6 py-8 min-h-screen">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">Gestión de Ventas</h1>

      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-6">
        <div className="space-y-6 p-6 rounded-lg">
          <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className={activeTab === 'productos' ? 'block' : 'hidden'}>
            <ProductosPanel
              idPunto={idPunto}
              cliente={cliente}
              agregarArticulo={agregarArticulo}
              articulos={articulosSeleccionados}
              eliminarArticulo={eliminarArticulo}
              actualizarCantidad={actualizarCantidad}
              idShoppingCart={idShoppingCart}
              setIdShoppingCart={setIdShoppingCart}
              recargarProductos={recargarProductos}
            />
          </div>

          <div className={activeTab === 'servicios' ? 'block' : 'hidden'}>
            <ServiciosPanel
              cliente={cliente}
              agregarArticulo={agregarArticulo}
              articulos={articulosSeleccionados}
              eliminarArticulo={eliminarArticulo}
              actualizarCantidad={actualizarCantidad}
              idShoppingCart={idShoppingCart}
              setIdShoppingCart={setIdShoppingCart}
              recargarServicios={recargarProductos}
            />
          </div>

          <div className={activeTab === 'catalogo' ? 'block' : 'hidden'}>
            <CatalogoPanel />
          </div>
        </div>

        <div className="space-y-4 p-4 rounded-lg mt-12">
          <ClienteInfo
            cliente={cliente}
            setCliente={setCliente}
            recargarClientes={recargarClientes}
          />

          <ArticulosSeleccionados
            cliente={cliente}
            articulos={articulosSeleccionados}
            eliminarArticulo={eliminarArticulo}
            actualizarCantidad={actualizarCantidad}
            idPunto={idPunto}
            idShoppingCart={idShoppingCart}
            onPagoExitoso={handlePagoExitoso}
          />
        </div>
      </div>
    </div>
  );
};

export { PosContent };
