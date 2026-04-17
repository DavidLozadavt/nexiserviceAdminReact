import { Container } from '@/components/container';
import { useLayout } from '@/providers';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import React, { Fragment, useState } from 'react';
import MultimediaContent from './MultimediaContent';
import { ModalMultimedia } from './ModalMultimedia';
import { ReelsContent } from './ReelsContent';
import { KeenIcon } from '@/components';

const GestionSedesPage = () => {
  const { currentLayout } = useLayout();
  const [modalOpen, setModalOpen] = useState(false);
  const [reloadContent, setReloadContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'stories' | 'reels'>('stories');

  const handleModalOpen = () => {
    setModalOpen(true);
  };
  
  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleAfterSave = () => {
    setReloadContent((prev) => !prev);
    setModalOpen(false);
  };

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Carga contenido visual para atraer clientes</ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container>
        <div className="flex px-1 space-x-1 mb-6 bg-gray-100 rounded-lg dark:bg-gray-800 p-1 w-fit">
          <button
            onClick={() => setActiveTab('stories')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-all rounded-lg ${
              activeTab === 'stories'
                ? 'bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <KeenIcon icon="subtitle" className="text-lg" />
            Historias
          </button>
          <button
            onClick={() => setActiveTab('reels')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-all rounded-lg ${
              activeTab === 'reels'
                ? 'bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <KeenIcon icon="video" className="text-lg" />
            Reels / Shorts
          </button>
        </div>

        {activeTab === 'stories' ? (
          <>
            <ModalMultimedia open={modalOpen} onClose={handleModalClose} onSave={handleAfterSave} />
            <MultimediaContent reload={reloadContent} onNewHistoria={handleModalOpen} />
          </>
        ) : (
          <ReelsContent reload={reloadContent} />
        )}
      </Container>
    </Fragment>
  );
};

export default GestionSedesPage;