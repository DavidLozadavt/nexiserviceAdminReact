import { KeenIcon, Menu, MenuItem, MenuToggle } from '@/components';
import { toAbsoluteUrl } from '@/utils/Assets';

import { DropdownCardItem1 } from '@/partials/dropdowns/general';
import { ContratoInterface } from '../model/ContratoInterface';
import { useState } from 'react';
import { ModalUpdateDocument } from '../ModalUpdateDocument';

interface IRecentUploadsItem {
  image: string;
  desc: string;
  date: string;
  fileUrl?: string;
}
interface IRecentUploadsItems extends Array<IRecentUploadsItem> {}

interface IRecentUploadsProps {
  title: string;
  onSave?: () => void;
  contrato: ContratoInterface;
}

const ContractFiles = ({ title, contrato, onSave }: IRecentUploadsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<IRecentUploadsItem | null>(null);

  const handleAfterSave = () => {
    if (onSave) {
      onSave();
    }
    setIsModalOpen(false);
  };

  const items: IRecentUploadsItems = (contrato.documentosContrato || []).map((item) => ({
    image: 'pdf.svg',
    desc: item.AsignacionTipoDocumentoProceso.tipoDocumento.tituloDocumento,
    date: `${new Date(item.fechaCarga).toLocaleString()}`,
    fileUrl: item.rutaFileUrl,
    id: item.id
  }));

  const renderItem = (item: IRecentUploadsItem, index: number) => {
    return (
      <div key={index} className="flex items-center gap-3">
        <div className="flex items-center grow gap-2.5">
          <img src={toAbsoluteUrl(`/media/file-types/${item.image}`)} alt="" />

          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary mb-px">
              <a href={item?.fileUrl} target="_blank" rel="noopener noreferrer">
                {item.desc}
              </a>
            </span>
            <span className="text-xs text-gray-700">{item.date}</span>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedDocument(item);
            setIsModalOpen(true);
          }}
        >
          <KeenIcon className="text-lg" icon="pencil" />
        </button>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>

      <div className="card-body">
        {items.length > 0 ? (
          <div className="grid gap-2.5 lg:gap-5">
            {items.map((item, index) => renderItem(item, index))}
          </div>
        ) : (
          <div className="text-gray-500 text-center">No hay documentos disponibles.</div>
        )}
      </div>

      <ModalUpdateDocument
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        documento={selectedDocument}
        onSave={handleAfterSave}
      />
    </div>
  );
};

export {
  ContractFiles,
  type IRecentUploadsItem,
  type IRecentUploadsItems,
  type IRecentUploadsProps
};
