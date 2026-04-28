import clsx from 'clsx';
import { useEffect } from 'react';
import { Container } from '@/components/container';
import { MegaMenu } from '../mega-menu';
import { HeaderLogo, HeaderTopbar } from './';
import { Breadcrumbs, useDemo1Layout } from '../';
import { useLocation } from 'react-router';
import { useResponsive } from '@/hooks';

const Header = () => {
  const { headerSticky, layout, sidebarMouseLeave } = useDemo1Layout();
  const { pathname } = useLocation();
  const desktopMode = useResponsive('up', 'lg');

  const isSidebarCollapsed = layout.options.sidebar.collapse && sidebarMouseLeave;
  const isSidebarFixed = layout.options.sidebar.fixed;

  useEffect(() => {
    if (headerSticky) {
      document.body.setAttribute('data-sticky-header', 'on');
    } else {
      document.body.removeAttribute('data-sticky-header');
    }
  }, [headerSticky]);

  return (
    <header
      className={clsx(
        'header fixed top-0 z-[10] end-0 flex items-stretch shrink-0 transition-all duration-300',
        'backdrop-blur-md bg-white/80 dark:bg-coal-600/80 border-b border-gray-200 dark:border-white/5',
        headerSticky ? 'shadow-sm h-[60px] md:h-[70px]' : 'h-[70px] md:h-[80px]'
      )}
      style={{
        left: (desktopMode && isSidebarFixed) ? (isSidebarCollapsed ? '80px' : '280px') : '0'
      }}
    >
      <Container className="flex items-stretch justify-between lg:gap-4">
        <HeaderLogo />
        <div className="hidden lg:flex items-center">
          <Breadcrumbs />
        </div>
        <HeaderTopbar />
      </Container>
    </header>
  );
};

export { Header };
