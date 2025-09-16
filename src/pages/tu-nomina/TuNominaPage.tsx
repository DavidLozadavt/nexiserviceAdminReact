import { Fragment, useRef, useState } from 'react';
import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { TuNominaContent } from './TuNominaContent';
import axios from 'axios';

const TuNominaPage = () => {
  const { currentLayout } = useLayout();

  const [modalOpen, setModalOpen] = useState(false);
  const [reloadContent, setReloadContent] = useState(false);

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

  const handleLiquidar = async () => {
    try {
      await axios.post('ejecutar_nomina_procedure');
      handleAfterSave();
    } catch (error) {
      console.error('Error al asignar:', error);
    }
  };

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Gestiona las Nominas Existentes</ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <button className="btn btn-sm btn-light">Historial</button>
              <button className="btn btn-sm btn-light" onClick={handleLiquidar}>Liquidar</button>
              <button className="btn btn-sm btn-light">Contabilizar</button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        {/* <ModalTarifasRiesgo
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleAfterSave}
        /> */}
        <TuNominaContent reload={reloadContent} />
      </Container>
    </Fragment>
  );
};

export { TuNominaPage };
