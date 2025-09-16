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
import CajaContent from './CajaContent';
import { KeenIcon } from '@/components';
import ModalCerrarCaja from './ModalCerrarCaja';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RelojComponent from '../../../components/Reloj/RelojComponent';

const CajaPage = () => {
  const { idPunto } = useParams();
  const { currentLayout } = useLayout();
  const navigate = useNavigate(); 
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
    navigate('/punto-de-ventas/puntos-de-ventas'); 
  };

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>
              <RelojComponent/> 
              
                </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              {/* <RelojComponent />  */}
              <button className="btn btn-sm btn-light" onClick={handleModalOpen}>
                Cerrar caja
                <KeenIcon
                  icon="lock-2"
                />
              </button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <ModalCerrarCaja
          open={modalOpen}
          onClose={handleModalClose}
          idPunto={idPunto}
          onSave={handleAfterSave}
        />
        <CajaContent/>
      </Container>
    </Fragment>
  );
};

export default CajaPage;