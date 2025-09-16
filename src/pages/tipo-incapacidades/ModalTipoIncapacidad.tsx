import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { NumericFormat } from 'react-number-format';
import { useSnackbar } from 'notistack';

interface ModalProps {
  open: boolean;
  data?: any;
  onClose: () => void;
  onSave?: () => void;
}

const ModalTipoIncapacidad = ({ open, onClose, data, onSave }: ModalProps) => {
  console.log(data);
  const { enqueueSnackbar } = useSnackbar();
  const [tipoIncapacidad, setTipoIncapacidad] = useState('');
  const [responsable, setResponsable] = useState('');
  const [porcentajeDePago, setPorcentajeDePago] = useState('');
  const [duracionCubierta, setDuracionCubierta] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const validate = () => {
    const newErrors: {
      tipoIncapacidad: string;
      responsable: string;
      porcentajeDePago: string;
      duracionCubierta: string;
      descripcion: string;
    } = {
      tipoIncapacidad: '',
      responsable: '',
      porcentajeDePago: '',
      duracionCubierta: '',
      descripcion: ''
    };

    if (!tipoIncapacidad.trim()) newErrors.tipoIncapacidad = 'El tipo de incapacidad es requerido.';
    if (!responsable.trim()) newErrors.responsable = 'El responsable es requerido.';
    if (!porcentajeDePago.trim() || isNaN(Number(porcentajeDePago.replace(/[%]/g, '')))) {
      newErrors.porcentajeDePago =
        'El porcentaje de pago es requerido y debe ser un número válido.';
    } else if (Number(porcentajeDePago.replace(/[%]/g, '')) > 100) {
      newErrors.porcentajeDePago = 'El porcentaje de pago no puede ser mayor a 100.';
    }

    if (!duracionCubierta.trim()) newErrors.duracionCubierta = 'La duración es requerida.';
    if (!descripcion.trim()) newErrors.descripcion = 'La descripción es requerida.';

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      tipoIncapacidad,
      responsable,
      porcentajeDePago: String(porcentajeDePago).replace(/[%]/g, ''),
      duracionCubierta,
      descripcion
    };

    try {
      if (data) {
        await axios.put(`tipos_incapacidades/${data.id}`, payload);
        enqueueSnackbar('Incapacidad actualizada con éxito.', { variant: 'success' });
      } else {
        await axios.post('tipos_incapacidades', payload);
        enqueueSnackbar('Incapacidad guardada con éxito.', { variant: 'success' });
      }
      if (onSave) {
        onSave();
      }
      onClose();
    } catch (error) {
      enqueueSnackbar('Error al guardar los datos.', { variant: 'solid', state: 'danger' });
    }
  };

  const [errors, setErrors] = useState<{
    tipoIncapacidad: string;
    responsable: string;
    porcentajeDePago: string;
    duracionCubierta: string;
    descripcion: string;
  }>({
    tipoIncapacidad: '',
    responsable: '',
    porcentajeDePago: '',
    duracionCubierta: '',
    descripcion: ''
  });

  useEffect(() => {
    if (open) {
      setTipoIncapacidad(data?.tipoIncapacidad || '');
      setResponsable(data?.responsable || '');
      setPorcentajeDePago(data?.porcentajeDePago ? String(data.porcentajeDePago) : '');
      setDuracionCubierta(data?.duracionCubierta || '');
      setDescripcion(data?.descripcion || '');
      setErrors({
        tipoIncapacidad: '',
        responsable: '',
        porcentajeDePago: '',
        duracionCubierta: '',
        descripcion: ''
      });
    }
  }, [open, data]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>
            {data ? 'Editar Tipo de Incapacidad' : 'Nuevo Tipo de Incapacidad'}
          </ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="grid gap-3 px-0 py-5">
          <div>
            <label className="block mb-1 text-sm font-medium">Tipo de Incapacidad</label>
            <textarea
              className={`textarea p-2 border ${errors.tipoIncapacidad ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={tipoIncapacidad}
              placeholder="Ejemplo: Enfermedad común, accidente laboral, etc."
              rows={3}
              onChange={(e) => {
                setTipoIncapacidad(e.target.value);
                if (errors.tipoIncapacidad) setErrors((prev) => ({ ...prev, tipoIncapacidad: '' }));
              }}
            />
            {errors.tipoIncapacidad && (
              <p className="text-red-500 text-sm mt-1">{errors.tipoIncapacidad}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Responsable</label>
            <input
              type="text"
              className={`textarea p-2 border ${errors.responsable ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={responsable}
              placeholder="Ejemplo: Empresa, ARL, EPS, etc."
              onChange={(e) => {
                setResponsable(e.target.value);
                if (errors.responsable) setErrors((prev) => ({ ...prev, responsable: '' }));
              }}
            />
            {errors.responsable && (
              <p className="text-red-500 text-sm mt-1">{errors.responsable}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Porcentaje de Pago (%)</label>
            <input
              type="text"
              className={`input p-2 border ${errors.porcentajeDePago ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={porcentajeDePago}
              placeholder="Ejemplo: 50, 75, 100"
              onChange={(e) => {
                const value = e.target.value.replace(/[%]/g, '');
                if (!isNaN(Number(value)) && Number(value) > 100) {
                  setErrors((prev) => ({
                    ...prev,
                    porcentajeDePago: 'El porcentaje de pago no puede ser mayor a 100.'
                  }));
                } else {
                  setErrors((prev) => ({ ...prev, porcentajeDePago: '' }));
                }
                setPorcentajeDePago(e.target.value);
              }}
            />

            {errors.porcentajeDePago && (
              <p className="text-red-500 text-sm mt-1">{errors.porcentajeDePago}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Duración Cubierta</label>
            <textarea
              className={`textarea p-2 border ${errors.duracionCubierta ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={duracionCubierta}
              placeholder="Ejemplo: 15 días, 2 meses, etc."
              rows={3}
              onChange={(e) => {
                setDuracionCubierta(e.target.value);
                if (errors.duracionCubierta)
                  setErrors((prev) => ({ ...prev, duracionCubierta: '' }));
              }}
            />
            {errors.duracionCubierta && (
              <p className="text-red-500 text-sm mt-1">{errors.duracionCubierta}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Descripción</label>
            <textarea
              className={`textarea p-2 border ${errors.descripcion ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={descripcion}
              placeholder="Añade detalles sobre la incapacidad"
              rows={3}
              onChange={(e) => {
                setDescripcion(e.target.value);
                if (errors.descripcion) setErrors((prev) => ({ ...prev, descripcion: '' }));
              }}
            />
            {errors.descripcion && (
              <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4 px-4">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              Guardar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalTipoIncapacidad };
