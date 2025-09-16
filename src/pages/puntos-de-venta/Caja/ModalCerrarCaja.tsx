import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { NumericFormat } from 'react-number-format';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

interface ModalProps {
  open: boolean;
  idPunto?: any;
  onClose: () => void;
  onSave?: (data: any) => void;
}

const ModalCerrarCaja = ({ open, idPunto, onClose, onSave }: ModalProps) => {
  const [valorEfectivo, setValorEfectivo] = useState<string>('');
  const [valorGasto, setValorGasto] = useState<string>('');
  const [valorTransaccion, setValorTransaccion] = useState<string>('');
  const [valorPropinas, setValorPropinas] = useState<string>('');
  const [valorCaja, setValorCaja] = useState<string>('0');
  const [exedente, setExedente] = useState<string>('');
  const [observacion, setObservacion] = useState<string>('');

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const isObservacionInvalida = observacion.trim() === '';

  useEffect(() => {
    const totalCaja =
      parseFloat(valorEfectivo || '0') +
      parseFloat(valorTransaccion || '0') +
      parseFloat(valorPropinas || '0') -
      parseFloat(valorGasto || '0');

    setValorCaja(totalCaja.toFixed(2));
  }, [valorEfectivo, valorTransaccion, valorPropinas, valorGasto]);

  const handleSave = async () => {
    try {
      const dataToSave = {
        valorEfectivo: parseFloat(valorEfectivo),
        valorGasto: parseFloat(valorGasto),
        valorTransaccion: parseFloat(valorTransaccion),
        valorPropinas: parseFloat(valorPropinas),
        valorCaja: parseFloat(valorCaja),
        observacion,
        idPuntoDeVenta: idPunto,
        exedente: parseFloat(exedente)
      };

      const response = await axios.post(`caja-cerrar/${idPunto}`, dataToSave);
      enqueueSnackbar('Caja cerrada correctamente', { variant: 'success' });
      onClose();
      if (onSave) {
        onSave(response.data);
      }
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message || 'Error al cerrar la caja';
      console.error('Error del backend:', errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'warning' });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>{'Cerrar caja'}</ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="grid gap-3 px-0 py-5">
          <div className="relative">
            <label htmlFor="valorGasto" className="block mb-1 text-sm font-medium">
              Valor de Gastos
            </label>
            <div className="relative flex items-center">
              <NumericFormat
                id="valorGasto"
                value={valorGasto}
                onValueChange={({ value }) => setValorGasto(value)}
                className="w-full p-2 border border-gray-300 rounded-md input"
                thousandSeparator
                prefix="$"
              />
              <button
                type="button"
                className="absolute flex items-center justify-center w-5 h-5 text-sm text-white bg-green-500 rounded-full right-2"
                title="Información sobre gastos"
              >
                i
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="valorEfectivo" className="block mb-1 text-sm font-medium">
              Valor en Efectivo
            </label>
            <div className="relative flex items-center">

              <NumericFormat
                id="valorEfectivo"
                value={valorEfectivo}
                onValueChange={({ value }) => setValorEfectivo(value)}
                className="w-full p-2 border border-gray-300 rounded-md input"
                thousandSeparator
                prefix="$"
              />
              <button
                type="button"
                className="absolute flex items-center justify-center w-5 h-5 text-sm text-white bg-green-500 rounded-full right-2"
                title="Información sobre gastos"
              >
                i
              </button>
            </div>
          </div>


          <div>
            <label htmlFor="valorTransaccion" className="block mb-1 text-sm font-medium">
              Valor en Transferencias
            </label>
            <div className="relative flex items-center">

            <NumericFormat
              id="valorTransaccion"
              value={valorTransaccion}
              onValueChange={({ value }) => setValorTransaccion(value)}
              className="w-full p-2 border border-gray-300 rounded-md input"
              thousandSeparator
              prefix="$"
            />
             <button
                type="button"
                className="absolute flex items-center justify-center w-5 h-5 text-sm text-white bg-green-500 rounded-full right-2"
                title="Información sobre gastos"
              >
                i
              </button>
          </div>
          </div>


          <div>
            <label htmlFor="valorPropinas" className="block mb-1 text-sm font-medium">
              Valor Propinas
            </label>
            <NumericFormat
              id="valorPropinas"
              value={valorPropinas}
              onValueChange={({ value }) => setValorPropinas(value)}
              className="w-full p-2 border border-gray-300 rounded-md input"
              thousandSeparator
              prefix="$"
            />
          </div>

          <div>
            <label htmlFor="valorCaja" className="block mb-1 text-sm font-medium">
              Caja
            </label>
            <NumericFormat
              id="valorCaja"
              value={valorCaja}
              className="w-full p-2 bg-green-100 border border-green-300 rounded-md input"
              thousandSeparator
              prefix="$"
              disabled
            />
          </div>

          <div>
            <label htmlFor="exedente" className="block mb-1 text-sm font-medium">
              Excedente
            </label>
            <NumericFormat
              id="exedente"
              value={exedente}
              onValueChange={({ value }) => setExedente(value)}
              className="w-full p-2 border border-gray-300 rounded-md input"
              thousandSeparator
              prefix="$"
            />
          </div>

          <div>
            <label htmlFor="observacion" className="block mb-1 text-sm font-medium">
              Observación
            </label>
            <textarea
              id="observacion"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className={`w-full p-2 rounded-md textarea ${isObservacionInvalida ? 'border-red-500' : 'border-gray-300'
                }`}
              rows={5}
              placeholder="Observación..."
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isObservacionInvalida}
            >
              Guardar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalCerrarCaja;
