import { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { IdocuensType } from './model/TipoDocumentInterface';

interface ModalProps {
  open: boolean;
  documentmentType?: IdocuensType;
  onClose: () => void;
  onSave?: () => void;
}

const ModalTipoDocumento = ({ open, onClose, documentmentType, onSave }: ModalProps) => {
  const [tituloDoc, setTituloDoc] = useState('');
  const [description, setDescription] = useState('');
  const [idProceso, setIdProceso] = useState<number>(0); 
  const [procesos, setProcesos] = useState<any[]>([]);

  useEffect(() => {
    const fetchProcesos = async () => {
      try {
        const response = await axios.get('procesos');
        setProcesos(response.data); 
      } catch (error) {
        console.error('Error al obtener los procesos:', error);
      }
    };

    fetchProcesos();

    if (documentmentType) {
      setTituloDoc(documentmentType.tipoDocumento.tituloDocumento);
      setDescription(documentmentType.tipoDocumento.descripcion);
      setIdProceso(documentmentType.idProceso); 
    } else {
      clearFields();
    }
  }, [documentmentType, open]);

  const clearFields = () => {
    setTituloDoc('');
    setDescription('');
    setIdProceso(0);
  };

  const handleSave = async () => {
    try {
      const data = { 
        idProceso,
        tituloDocumento: tituloDoc,
        descripcion: description,
        idEstado: 1
      };

      if (documentmentType) {
        await axios.put(`tipo_documentos/${documentmentType.id}`, data);
      } else {
        await axios.post('tipo_documentos', data);
      }

      if (onSave) {
        onSave();
      }
      clearFields(); 
    } catch (error) {
      console.error('Error al guardar el documento:', error);
    }
  };

  return (
    <Modal open={open} onClose={() => { clearFields(); onClose(); }}>
      <ModalContent className="max-w-[600px] top-[15%] p-4">
        <ModalHeader>
          <ModalTitle>{documentmentType ? 'Editar Tipo de Pago' : 'Nuevo Tipo de Pago'}</ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={() => { clearFields(); onClose(); }}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="grid gap-5 px-0 py-5">
          <input
            className="input p-2 border border-gray-300 rounded-md w-[calc(100%-2rem)] mx-auto"
            placeholder="Ingrese el tipo de pago"
            type="text"
            value={tituloDoc}
            onChange={(e) => setTituloDoc(e.target.value)}
          />

          <input
            className="input p-2 border border-gray-300 rounded-md w-[calc(100%-2rem)] mx-auto mt-4"
            placeholder="Ingrese la descripción"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <select
            className="input p-2 border border-gray-300 rounded-md w-[calc(100%-2rem)] mx-auto mt-4"
            value={idProceso}
            onChange={(e) => setIdProceso(Number(e.target.value))}
          >
            <option value={0}>Seleccione un proceso</option>
            {procesos.map((proceso) => (
              <option key={proceso.id} value={proceso.id}>
                {proceso.nombreProceso} 
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3 px-4 mt-4">
            <button className="btn btn-secondary" onClick={() => { clearFields(); onClose(); }}>
              Cancelar
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              Guardar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalTipoDocumento };
