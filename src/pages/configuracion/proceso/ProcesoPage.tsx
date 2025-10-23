import { Container } from '@/components/container';
import { useLayout } from '@/providers';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import React, { Fragment, useState } from 'react'
import ProcesoContent from './ProcesoContent';
import ModalProceso from './ModalProceso';

const ProcesoPage = () => {
  const {currentLayout} = useLayout();
  const  [procesoModalOpen, setProcesoModalOpen] = useState(false);
  const [reloadContent, setReloadContent ] = useState(false);

  const handleProcesoModalOpen = () => {
    setProcesoModalOpen(true);
  };
  const handleModalClose = () => {
    setProcesoModalOpen(false);
  };
  const handleAfterSave = () => {
    setReloadContent((prev) =>!prev);
    setProcesoModalOpen(false);
  };
  
    return (
      <Fragment>
        {currentLayout?.name === 'demo1-layout' && (
          <Container>
          </Container>
        )}
  
        <Container>
          <ModalProceso
            open={procesoModalOpen}
            onClose={handleModalClose}
            onSave={handleAfterSave}
          />
          <ProcesoContent reload={reloadContent}/>
        </Container>
      </Fragment>
    );
  };
  


export default ProcesoPage