import React, { useEffect, useState } from 'react'
import { ProcesoInterface } from './model/ProcesoInterface';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components/keenicons';
import { useEmpresaThemeContext } from '../../colores/EmpresaThemeProvider'; // 🔑

interface ModalProps {
  open: boolean;
  process?: ProcesoInterface;
  onClose: () => void;
  onSave?: () => void;
}

const ModalProceso = ({ open, process, onClose, onSave }: ModalProps) => {
  const { styles } = useEmpresaThemeContext(); // ✅ Tema dinámico
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
    <Modal open={open} onClose={handleClose}>
      <ModalContent className="max-w-[600px] top-[15%] p-4">
        <ModalHeader className={styles.card}>
          <ModalTitle className={styles.text}>
            {process ? 'Editar Proceso' : 'Nuevo Proceso'}
          </ModalTitle>
          <button className={`btn btn-sm btn-icon ${styles.button} ${styles.buttonHover}`} onClick={handleClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="grid gap-5 px-0 py-5">
          <input
            className={`p-2 border rounded-md w-[calc(100%-2rem)] mx-auto ${styles.input}`}
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

          <div className="flex justify-end gap-3 mt-4 px-4">
            <button className={`btn btn-sm ${styles.button}`} onClick={handleClose}>
              Cancelar
            </button>
            <button onClick={handleSave} className={`btn btn-sm ${styles.primary} ${styles.primaryHover}`}>
              Guardar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default ModalProceso;
