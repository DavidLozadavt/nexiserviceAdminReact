import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Container } from '@/components/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/toolbar';

import NexiDashboard from './NexiDashboard';

const Demo1LightSidebarPage = () => {
  return (
    <Fragment>
      <Container>
        <NexiDashboard />
      </Container>
    </Fragment>
  );
};

export { Demo1LightSidebarPage };
