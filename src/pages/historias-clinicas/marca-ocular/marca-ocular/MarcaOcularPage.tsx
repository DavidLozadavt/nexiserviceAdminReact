import { Fragment, useState } from 'react';
import { Container } from '@/components/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { Tabs, Tab, TabPanel, TabsList } from '@/components/tabs';
import { KeenIcon } from '@/components';
import MarcaOcularContent from './MarcaOcularContent';
import MarcaFisioterapiaContent from './MarcaFisioterapiaContent';


const MarcaOcularPage = () => {
  const { currentLayout } = useLayout();
  const [reloadContent, setReloadContent] = useState(false);

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>
                Registra y visualiza marcas médicas - Oftalmología y Fisioterapia
              </ToolbarDescription>
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container>
        <Tabs defaultValue={1}>
          {/* Navegación de tabs */}
          <div className="card mb-5">
            <div className="card-body p-0">
              <TabsList className="nav nav-tabs nav-tabs-line nav-stretch px-5">
                <Tab value={1} className="nav-link flex items-center gap-2">
                  <KeenIcon icon="eye" className="text-lg" />
                  <span className="nav-text">Oftalmología</span>
                </Tab>
                <Tab value={2} className="nav-link flex items-center gap-2">
                  <KeenIcon icon="profile-user" className="text-lg" />
                  <span className="nav-text">Fisioterapia</span>
                </Tab>
              </TabsList>
            </div>
          </div>

          {/* Contenido de las tabs */}
          <TabPanel value={1}>
            <MarcaOcularContent reload={reloadContent} />
          </TabPanel>

          <TabPanel value={2}>
            <MarcaFisioterapiaContent reload={reloadContent} />
          </TabPanel>
        </Tabs>
      </Container>
    </Fragment>
  );
};

export { MarcaOcularPage };
