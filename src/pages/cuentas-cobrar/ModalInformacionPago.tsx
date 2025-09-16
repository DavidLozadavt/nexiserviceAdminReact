import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';

interface ModalProps {
  open: boolean;
  data?: any;
  onClose: () => void;
  onSave?: () => void;
}

const ModalInformacionPago = ({ open, onClose, data, onSave }: ModalProps) => {
  const retencionSI = parseFloat(data?.retencionSI?.valor) || 0;
  const retencionNO = parseFloat(data?.retencionNO?.valor) || 0;
  const total = retencionSI + retencionNO;

  const tables = [
    {
      status: 'Retención 10%:',
      info: retencionSI.toFixed(2)
    },
    {
      status: 'Valor del Pago:',
      info: retencionNO.toFixed(2)
    },
    {
      status: 'Total:',
      info: total.toFixed(2)
    },
  ];

  const renderTable = (table: any, index: any) => {
    return (
      <tr key={index}>
        <td className="text-sm text-gray-600 pb-6 pe-16">{table.status}</td>
        <td
          className="text-sm text-gray-900 pb-6"
          dangerouslySetInnerHTML={{ __html: table.info }}
        />
      </tr>
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[400px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>Información del Pago </ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="grid gap-6 px-0 py-5">
          <div className="card-body pt-4 pb-2">
            <table className="table-auto">
              <tbody>
                {tables.map((table, index) => {
                  return renderTable(table, index);
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 mt-2 px-4">
            <button className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
            
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalInformacionPago };
