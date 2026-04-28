import React, { forwardRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useDemo1Layout } from '../';
import { toAbsoluteUrl } from '@/utils';
import { SidebarToggle } from './';
import { useAuthContext } from '@/auth/useAuthContext';

const SidebarHeader = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { layout, sidebarMouseLeave } = useDemo1Layout();
  const authContext = useAuthContext();
  const { empresa } = authContext;

  const isCollapsed = layout.options.sidebar.collapse && sidebarMouseLeave;
  const logoUrl = empresa?.rutaLogoUrl || toAbsoluteUrl('/media/app/logoweb.png');

  const lightLogo = () => (
    <Fragment>
      {!isCollapsed ? (
        <Fragment>
          <Link to="/" className="w-full px-10 dark:hidden">
            <div className="flex justify-center w-full ">
              <img
                src={logoUrl}
                className="object-cover border-2 border-gray-300 rounded-full shadow-md default-logo w-28 h-28"
              />
            </div>
          </Link>
          <Link to="/" className="hidden w-full dark:block">
            <div className="flex justify-center w-full">
              <img
                src={logoUrl}       
                className="object-cover border-2 border-gray-300 rounded-full shadow-md default-logo w-28 h-28"
              />
            </div>
          </Link>
        </Fragment>
      ) : (
        <Link to="/" className="flex justify-center items-center w-full">
          <img
            src={logoUrl}
            className="object-cover border border-gray-300 rounded-full shadow-sm w-9 h-9"
          />
        </Link>
      )}
    </Fragment>
  );

  const darkLogo = () => (
    <Fragment>
      {!isCollapsed ? (
        <Link to="/" className='w-full'>
          <div className="flex justify-center w-full">
            <img
              src={logoUrl}        
              className="object-cover border-2 border-gray-300 rounded-full shadow-md default-logo w-28 h-28"
            />
          </div>
        </Link>
      ) : (
        <Link to="/" className="flex justify-center items-center w-full">
          <img
            src={logoUrl}
            className="object-cover border border-gray-300 rounded-full shadow-sm w-9 h-9"
          />
        </Link>
      )}
    </Fragment>
  );

  return (
    <div
      ref={ref}
      className="relative items-center justify-between hidden px-6 py-12 pb-1 mt-4 mb-14 sidebar-header lg:flex shrink-0"
    >
      {layout.options.sidebar.theme === 'light' ? lightLogo() : darkLogo()}
      <SidebarToggle />
    </div>
  );
});

export { SidebarHeader };
