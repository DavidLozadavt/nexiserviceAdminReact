import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import Select from 'react-select';
import { useSnackbar } from 'notistack';
import { TipoIncapacidadInterface } from '@/pages/tipo-incapacidades/models/TipoIncapacidadInterface';

interface ModalProps {
  open: boolean;
  data?: any;
  onClose: () => void;
  onSave: () => void;
}

const ModalCreateIncapacidadLicencia = ({ open, onClose, data, onSave }: ModalProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [fechaInicial, setFechaInicial] = useState(data?.fechaInicial || '');
  const [fechaFinal, setFechaFinal] = useState(data?.fechaFinal || '');
  const [tipo, setTipo] = useState(data?.tipo || '');
  const [numeroDias, setNumeroDias] = useState(data?.numeroDias || '');
  const [comentario, setComentario] = useState(data?.comentario || '');
  const [selectedContrato, setSelectedContrato] = useState(null);

  const [imagen, setImagen] = useState(null);
  const [contratos, setContratos] = useState<any[]>([]);
  const [tipoIncapacidades, setTipoIncapacidades] = useState<TipoIncapacidadInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [errors, setErrors] = useState({
    fechaInicial: '',
    fechaFinal: '',
    tipo: '',
    comentario: '',
    imagen: '',
    idContrato: ''
  });

  useEffect(() => {
    if (open) {
      setFechaInicial('');
      setFechaFinal('');
      setTipo('');
      setNumeroDias('');
      setComentario('');
      setImagen(null);
      setSelectedContrato(null);
      setErrors({
        fechaInicial: '',
        fechaFinal: '',
        tipo: '',
        comentario: '',
        imagen: '',
        idContrato: ''
      });
    }
  }, [open]);

  useEffect(() => {
    if (fechaInicial && fechaFinal) {
      const inicio = new Date(fechaInicial).getTime();
      const fin = new Date(fechaFinal).getTime();

      if (fin >= inicio) {
        const diffTime = Math.abs(fin - inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setNumeroDias(diffDays.toString());
        setErrors((prev) => ({ ...prev, fechaFinal: '' }));
      } else {
        setNumeroDias('');
        setErrors((prev) => ({
          ...prev,
          fechaFinal: 'La fecha final no puede ser menor que la inicial.'
        }));
      }
    }
  }, [fechaInicial, fechaFinal]);

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
    }
  };

  const validate = () => {
    const newErrors = {
      fechaInicial: fechaInicial ? '' : 'La fecha inicial es requerida.',
      fechaFinal: fechaFinal ? errors.fechaFinal || '' : 'La fecha final es requerida.',
      tipo: tipo.trim() ? '' : 'El tipo es requerido.',
      idContrato: selectedContrato ? '' : 'El Contrato es requerido.',
      comentario: comentario.trim() ? '' : 'El comentario es requerido.',
      imagen: imagen ? '' : 'El documento es requerido.'
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append('fechaInicial', fechaInicial);
    formData.append('fechaFinal', fechaFinal);
    formData.append('idTipoIncapacidad', tipo);
    formData.append('comentario', comentario);
    formData.append('idContrato', selectedContrato + ' ');
    if (imagen) formData.append('soporte', imagen);

    try {
      await axios.post('solicitud_inc_personas', formData);
      enqueueSnackbar('Datos guardados con éxito.', { variant: 'success' });
      onSave();
      onClose();
    } catch (error) {
      enqueueSnackbar('Error al guardar los datos.', { variant: 'error' });
    }
  };

  const fetchTipoIncapacidades = async () => {
    setLoading(true);
    try {
      const response = await axios.get('tipos_incapacidades');
      setTipoIncapacidades(response.data);
    } catch (error) {
      setError('Error al cargar los medios de pago');
    } finally {
      setLoading(false);
    }
  };

  const fetchContratos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('contracts_actives_nominas');
      setContratos(response.data);
    } catch (error) {
      setError('Error al cargar ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipoIncapacidades();
    fetchContratos();
  }, []);

  const options = contratos.map((contrato) => ({
    value: contrato.id,
    label: `${contrato.persona?.nombre1} ${contrato.persona?.apellido1}`
  }));

  const theme = JSON.parse(localStorage.getItem('settings-configs') || '{}')?.themeMode;

  const isDarkMode = theme === 'dark';
  const background = isDarkMode ? '#1B1C22' : '#F9F9F9';
  const color = isDarkMode ? 'white' : '#4B5675';
  const fontSize = isDarkMode ? '0.875rem' : '1rem';
  const iconColor = isDarkMode ? 'white' : '#4B5675';

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: background,
      color: color,
      fontSize: fontSize,
      borderColor: isDarkMode ? '#2D2E36' : '#E4E6EF',
      boxShadow: 'none',
      '&:hover': {
        borderColor: isDarkMode ? '#555' : '#A1A5B7'
      }
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: color,
      fontSize: fontSize
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: isDarkMode ? '#aaa' : '#A1A5B7',
      fontSize: fontSize
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: iconColor,
      '&:hover': { color: iconColor }
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: iconColor
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: background,
      color: color,
      borderRadius: '0.5rem',
      boxShadow: isDarkMode ? '0 2px 6px rgba(0,0,0,0.6)' : '0 2px 6px rgba(0,0,0,0.15)'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? isDarkMode
          ? '#333'
          : '#E4E6EF'
        : state.isFocused
          ? isDarkMode
            ? '#2D2E36'
            : '#F1F1F1'
          : background,
      color: color,
      fontSize: fontSize
    })
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[5%] p-4">
        <ModalHeader>
          <ModalTitle>Solicitud de Incapacidades y Licencias</ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="grid gap-3 px-0 py-5">
          <div>
            <label htmlFor="contrato" className="block mb-1 text-sm font-medium">
              Seleccione un Contrato
            </label>
            <Select
              id="contrato"
              options={options}
              isLoading={loading}
              isClearable
              placeholder="Seleccione un contrato"
              value={options.find((option) => option.value === selectedContrato) || null}
              onChange={(selectedOption) =>
                setSelectedContrato(selectedOption ? selectedOption.value : '')
              }
              className="w-full"
              styles={customStyles}
            />

            {errors.idContrato && <p className="text-red-500 text-sm mt-1">{errors.idContrato}</p>}
          </div>

          <div>
            <label htmlFor="fechaInicial" className="block mb-1 text-sm font-medium">
              Fecha Inicial
            </label>
            <input
              type="date"
              id="fechaInicial"
              className={`input p-2 border ${errors.fechaInicial ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={fechaInicial}
              onChange={(e) => {
                setFechaInicial(e.target.value);
                if (errors.fechaInicial) setErrors((prev) => ({ ...prev, fechaInicial: '' }));
              }}
            />
            {errors.fechaInicial && (
              <p className="text-red-500 text-sm mt-1">{errors.fechaInicial}</p>
            )}
          </div>

  
          <div>
            <label htmlFor="fechaFinal" className="block mb-1 text-sm font-medium">
              Fecha Final
            </label>
            <input
              type="date"
              id="fechaFinal"
              className={`input p-2 border ${errors.fechaFinal ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={fechaFinal}
              onChange={(e) => {
                setFechaFinal(e.target.value);
                if (errors.fechaFinal) setErrors((prev) => ({ ...prev, fechaFinal: '' }));
              }}
            />
            {errors.fechaFinal && <p className="text-red-500 text-sm mt-1">{errors.fechaFinal}</p>}
          </div>

          <div>
            <label htmlFor="tipo" className="block mb-1 text-sm font-medium">
              Tipo Incapacidad
            </label>
            <select
              id="tipo"
              className={`input p-2 border ${errors.tipo ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                if (errors.tipo) setErrors((prev) => ({ ...prev, tipo: '' }));
              }}
            >
              <option value="">Seleccione un tipo</option>
              {tipoIncapacidades.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.tipoIncapacidad}
                </option>
              ))}
            </select>

            {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
          </div>

   
          <div>
            <label htmlFor="numeroDias" className="block mb-1 text-sm font-medium">
              Número de Días
            </label>
            <input
              disabled
              type="text"
              id="numeroDias"
              className="input p-2 border border-gray-300 rounded-md w-full"
              value={numeroDias}
            />
          </div>

          <div>
            <label htmlFor="comentario" className="block mb-1 text-sm font-medium">
              Comentario
            </label>
            <textarea
              id="comentario"
              className={`textarea p-2 border ${errors.comentario ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Escribe un comentario"
              rows={3}
              value={comentario}
              onChange={(e) => {
                setComentario(e.target.value);
                if (errors.comentario) setErrors((prev) => ({ ...prev, comentario: '' }));
              }}
            />
            {errors.comentario && <p className="text-red-500 text-sm mt-1">{errors.comentario}</p>}
          </div>

          <div>
            <label htmlFor="imagen" className="block mb-1 text-sm font-medium">
              Archivo
            </label>
            <input
              type="file"
              id="imagen"
              className="file-input p-2 border border-gray-300 rounded-md w-full"
              onChange={(e) => {
                handleFileChange(e);
                if (errors.imagen) setErrors((prev) => ({ ...prev, imagen: '' }));
              }}
            />
            {errors.imagen && <p className="text-red-500 text-sm mt-1">{errors.imagen}</p>}
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

export { ModalCreateIncapacidadLicencia };
