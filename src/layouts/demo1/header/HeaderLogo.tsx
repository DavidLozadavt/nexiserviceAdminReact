import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import { toAbsoluteUrl } from '@/utils';

import { useDemo1Layout } from '../';

const HeaderLogo = () => {
  const { setMobileSidebarOpen, setMobileMegaMenuOpen, megaMenuEnabled } = useDemo1Layout();

  const handleSidebarOpen = () => {
    setMobileSidebarOpen(true);
  };

  const handleMegaMenuOpen = () => {
    setMobileMegaMenuOpen(true);
  };

  return (
    <div className="flex items-center gap-2 lg:hidden">
      <Link to="/" className="flex items-center shrink-0">
        <img src={toAbsoluteUrl('/media/app/mini-logo.svg')} className="h-[28px] md:h-[32px]" alt="mini-logo" />
      </Link>

      <div className="flex items-center">
        <button
          type="button"
          className="btn btn-icon btn-light btn-clear btn-sm hover:bg-gray-100 dark:hover:bg-white/5"
          onClick={handleSidebarOpen}
        >
          <KeenIcon icon="menu" className="text-xl" />
        </button>

        {megaMenuEnabled && (
          <button
            type="button"
            className="btn btn-icon btn-light btn-clear btn-sm hover:bg-gray-100 dark:hover:bg-white/5"
            onClick={handleMegaMenuOpen}
          >
            <KeenIcon icon="burger-menu-2" className="text-xl" />
          </button>
        )}
      </div>
    </div>
  );
};

export { HeaderLogo };
