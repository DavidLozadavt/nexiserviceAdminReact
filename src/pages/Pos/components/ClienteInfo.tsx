import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cliente } from '../models/ClienteModel';
import { Container } from '@/components';
import ModalClienteNuevo from './ModalClienteNuevo';
interface ClienteInfoProps {
  cliente?: Cliente | null;
  setCliente?: React.Dispatch<React.SetStateAction<Cliente | null>>;
  recargarClientes?: boolean;
}


const ClienteInfo = ({ setCliente, recargarClientes }: ClienteInfoProps) => {
  const [telefono, setTelefono] = useState('');
  const [clienteLocal, setClienteLocal] = useState<Cliente | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [showModalNuevoCliente, setshowModalNuevoCliente] = useState(false);


  useEffect(() => {
    const buscarCliente = async () => {
      if (!telefono) {
        setClienteLocal(null);
        setCliente!(null); 
        setError('');
        return;
      }

      setCargando(true);
      try {
        const res = await axios.get('/buscar_tercero', {
          params: {
            telefono: telefono,
            identificacion: telefono,
          },
        });

        const clienteEncontrado: Cliente = {
          id: res.data.id,
          nombre: res.data.nombre,
          email: res.data.email,
          direccion: res.data.direccion,
        };

        setClienteLocal(clienteEncontrado);
        setCliente!(clienteEncontrado);
        setError('');
      } catch (err) {
        setClienteLocal(null);
        setCliente!(null); 
        setError('Cliente no encontrado');
      } finally {
        setCargando(false);
      }
    };

    const delayDebounce = setTimeout(buscarCliente, 600);
    return () => clearTimeout(delayDebounce);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telefono]);
  useEffect(() => {
    setTelefono('');
    setClienteLocal(null);
    setError('');
  }, [recargarClientes]);
  

  return (
    <div className="p-4 border rounded">
      <h3 className="mb-2 font-semibold">Datos del Cliente</h3>

      <input
        type="text"
        placeholder="Teléfono del Cliente/Identificación"
        className="w-full p-2 mb-2 border rounded input input-sm"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />

      {cargando && <p className="mb-2 text-sm text-gray-500">Buscando cliente...</p>}

      {clienteLocal && (
        <div className="space-y-2 text-sm text-left">
          <div>
            <label className="block font-semibold">Nombre:</label>
            <input
              value={clienteLocal.nombre}
              readOnly
              className="w-full p-2 bg-gray-100 border rounded dark:bg-neutral-800"
            />
          </div>
          <div>
            <label className="block font-semibold">Email:</label>
            <input
              value={clienteLocal.email}
              readOnly
              className="w-full p-2 bg-gray-100 border rounded dark:bg-neutral-800"
            />
          </div>
          <div>
            <label className="block font-semibold">Dirección:</label>
            <input
              value={clienteLocal.direccion}
              readOnly
              className="w-full p-2 bg-gray-100 border rounded dark:bg-neutral-800"
            />
          </div>
        </div>
      )}

      {error && !cargando && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <button
        onClick={() => setshowModalNuevoCliente(true)}
        className="w-full px-4 py-2 mt-4 font-semibold text-white bg-green-500 rounded hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600"
      >
        Nuevo
      </button>

      <Container>
        <ModalClienteNuevo
          open={showModalNuevoCliente}
          onClose={() => setshowModalNuevoCliente(false)}
          onSave={() => {}}
        />
      </Container>
    </div>
  );
};

export { ClienteInfo };
