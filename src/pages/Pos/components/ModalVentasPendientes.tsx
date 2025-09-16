import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalTitle
} from '@/components/modal';
import { KeenIcon, DataGrid } from '@/components';
import axios from 'axios';
import { ColumnDef } from '@tanstack/react-table';
import { VentasPendientes } from '../models/VentasPendientesModel';

interface ModalPendientesProps {
  open: boolean;
  onClose: () => void;
}

const ModalVentasPendientes = ({ open, onClose }: ModalPendientesProps) => {
  const [ventas, setVentas] = useState<VentasPendientes[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      axios.get('get_shoppingcart_productos_pos')
        .then((res) => {
          setVentas(res.data);
        })
        .catch((err) => {
          console.error('Error al obtener ventas pendientes:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return ventas;
    return ventas.filter((venta) =>
      venta.tercero?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venta.asignaciones?.some(a =>
        a.producto?.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [ventas, searchTerm]);

  const columns = useMemo<ColumnDef<VentasPendientes>[]>(() => [
    {
      accessorFn: (row) => row.id,
      id: 'codigo',
      header: () => 'Código',
      cell: (info) => <span>{info.row.original.id}</span>,
      meta: { className: 'w-[100px]' }
    },
    {
      accessorFn: (row) => row.asignaciones?.map(a => a.producto?.modelo).join(', ') ?? '',
      id: 'productos',
      header: () => 'Productos',
      cell: (info) => (
        <ul className="list-disc list-inside text-sm">
          {info.row.original.asignaciones?.map((a, i) => (
            <li key={i}>{a.producto?.modelo}</li>
          ))}
        </ul>
      ),
      meta: { className: 'min-w-[200px]' }
    },
    {
      accessorFn: (row) => row.asignaciones?.map(a => a.cantidad).join(', ') ?? '',
      id: 'cantidad',
      header: () => 'Cantidad',
      cell: (info) => (
        <ul className="list-disc list-inside text-sm">
          {info.row.original.asignaciones?.map((a, i) => (
            <li key={i}>{a.cantidad}</li>
          ))}
        </ul>
      ),
      meta: { className: 'min-w-[120px]' }
    },
    {
      accessorFn: (row) => row.tercero?.nombre ?? 'N/A',
      id: 'cliente',
      header: () => 'Cliente',
      cell: (info) => <span>{info.row.original.tercero?.nombre ?? 'N/A'}</span>,
      meta: { className: 'min-w-[180px]' }
    },
    {
      accessorFn: (row) => row.estado ?? 'N/A',
      id: 'estado',
      header: () => 'Estado',
      cell: (info) => <span className="uppercase">{info.row.original.estado}</span>,
      meta: { className: 'min-w-[100px]' }
    },
    {
      id: 'acciones',
      header: () => 'Acciones',
      cell: ({ row }) => (
        <button className="btn btn-sm btn-primary">
          <KeenIcon icon="eye" />
        </button>
      ),
      meta: { className: 'w-[80px]' }
    }
  ], []);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[900px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>Ventas Pendientes</ModalTitle>
          <button
            className="btn btn-sm btn-icon btn-light btn-clear"
            onClick={onClose}
          >
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="px-0 py-5">
          <div className="px-4 mb-4">
            <input
              type="text"
              placeholder="Buscar carrito..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm w-full"
            />
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-10">Cargando...</div>
            ) : (
              <DataGrid
                key={JSON.stringify(filteredData)}
                columns={columns}
                data={filteredData}
                pagination={{ size: 10 }}
              />
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalVentasPendientes;
