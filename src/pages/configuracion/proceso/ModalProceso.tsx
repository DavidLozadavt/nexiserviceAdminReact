import React, { useEffect, useState } from 'react';
import { ProcesoInterface } from './model/ProcesoInterface';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components/keenicons';
import { useEmpresaThemeContext } from '../../../colores/EmpresaThemeProvider';

interface ModalProps {
  open: boolean;
  process?: ProcesoInterface;
  onClose: () => void;
  onSave?: () => void;
}

const ModalProceso = ({ open, process, onClose, onSave }: ModalProps) => {
  const { styles } = useEmpresaThemeContext();
  const [nombreProceso, setNombreProceso] = useState(process?.nombreProceso || '');
  const [descripcion, setDescripcionProceso] = useState(process?.descripcion || '');

  useEffect(() => {
    if (process) {
      setNombreProceso(process.nombreProceso);
      setDescripcionProceso(process.descripcion);
    } else {
      setNombreProceso('');
      setDescripcionProceso('');
    }
  }, [process, open]);

  const handleSave = async () => {
    try {
      if (process) {
        await axios.put(`procesos/${process.id}`, { nombreProceso, descripcion });
      } else {
        await axios.post('procesos', { nombreProceso, descripcion });
      }
      if (onSave) onSave();
      setNombreProceso('');
      setDescripcionProceso('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    setNombreProceso('');
    setDescripcionProceso('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader className={styles.card}>
          <ModalTitle className={styles.text}>
            {process ? 'Editar Proceso' : 'Nuevo Proceso'}
          </ModalTitle>
          <button
            className={`btn btn-sm btn-icon btn-light btn-clear shrink-0 ${styles.button}`}
            onClick={onClose}
          >
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="grid gap-3 px-0 py-5">
          <input
            className={`p-2 rounded-md w-full ${styles.input}`}
            placeholder="Nombre Proceso"
            type="text"
            value={nombreProceso}
            onChange={(e) => setNombreProceso(e.target.value)}
          />
          <input
            className={`p-2 border rounded-md w-[calc(100%-2rem)] mx-auto ${styles.input}`}
            placeholder="Descripción"
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcionProceso(e.target.value)}
          />

          <div className="flex justify-end gap-3 px-4 mt-4">
            <button className={`px-4 py-2 rounded bg-gray-200 hover:bg-gray-300`} onClick={onClose}>
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded ${styles.primary} ${styles.primaryHover} text-white`}
            >
              Guardar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalProceso;
