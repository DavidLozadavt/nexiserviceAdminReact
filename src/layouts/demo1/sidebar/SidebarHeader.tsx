import React, { forwardRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useDemo1Layout } from '../';
import { toAbsoluteUrl } from '@/utils';
import { SidebarToggle } from './';
import { useAuthContext } from '@/auth/useAuthContext';

const SidebarHeader = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { layout } = useDemo1Layout();
  const authContext = useAuthContext();
  const { empresa } = authContext

  const logoUrl = empresa?.rutaLogoUrl || toAbsoluteUrl('/media/app/logoweb.png');

  const lightLogo = () => (
    <Fragment>
      <Link to="/" className="w-full px-10 dark:hidden">
       <div className="flex justify-center w-full ">
        <img
          src={logoUrl}
    className="object-cover border-2 border-gray-300 rounded-full shadow-md default-logo w-28 h-28"
/>
        <img
          src={toAbsoluteUrl('/media/app/mini-logo.svg')}
          className="small-logo min-h-[22px] max-w-none"
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
        <img
          src={toAbsoluteUrl('/media/app/mini-logo.svg')}
          className="small-logo min-h-[22px] max-w-none"
        />
      </Link>
    </Fragment>
  );

  const darkLogo = () => (
    <Link to="/" className='w-full'>
     <div className="flex justify-center w-full">
            <img
                src={logoUrl}        
    className="object-cover border-2 border-gray-300 rounded-full shadow-md default-logo w-28 h-28"
            />
        </div>
      <img
        src={toAbsoluteUrl('/media/app/mini-logo.svg')}
        className="small-logo min-h-[22px] max-w-none"
      />
    </Link>
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
