import { useRef, useState } from 'react';
import { KeenIcon } from '@/components/keenicons';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { DropdownUser } from '@/partials/dropdowns/user';
import { DropdownNotifications } from '@/partials/dropdowns/notifications';
import { DropdownApps } from '@/partials/dropdowns/apps';
import { DropdownChat } from '@/partials/dropdowns/chat';
import { ModalSearch } from '@/partials/modals/search/ModalSearch';
import { useAuthContext } from '@/auth';

const HeaderTopbar = () => {
  const itemChatRef = useRef<any>(null);
  const itemAppsRef = useRef<any>(null);
  const itemNotificationsRef = useRef<any>(null);
  const authContext = useAuthContext();
  const { persona } = authContext;
  const handleShow = () => {
    window.dispatchEvent(new Event('resize'));
  };

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const handleOpen = () => setSearchModalOpen(true);
  const handleClose = () => {
    setSearchModalOpen(false);
  };

  return (
    <div className="flex items-stretch gap-1 md:gap-2 lg:gap-3.5">
      <div className="flex items-center">
        <button
          onClick={handleOpen}
          className="btn btn-icon btn-icon-lg size-8 md:size-9 rounded-full hover:bg-primary-light hover:text-primary text-gray-500 transition-colors"
        >
          <KeenIcon icon="magnifier" className="text-lg md:text-xl" />
        </button>
        <ModalSearch open={searchModalOpen} onClose={handleClose} />
      </div>

      <Menu className="items-stretch">
        <MenuItem
          ref={itemChatRef}
          onShow={handleShow}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [170, 0] 
                }
              }
            ]
          }}
        >
          <MenuToggle>
            <div className="btn btn-icon btn-icon-lg size-8 md:size-9 rounded-full hover:bg-primary-light hover:text-primary text-gray-500 menu-item-show:bg-primary-light menu-item-show:text-primary transition-colors">
              <KeenIcon icon="messages" className="text-lg md:text-xl" />
            </div>
          </MenuToggle>

          {DropdownChat({ menuTtemRef: itemChatRef })}
        </MenuItem>
      </Menu>

      <Menu className="items-stretch">
        <MenuItem
          ref={itemNotificationsRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [70, 0] 
                }
              }
            ]
          }}
        >
          <MenuToggle>
            <div className="relative btn btn-icon btn-icon-lg size-8 md:size-9 rounded-full hover:bg-primary-light hover:text-primary text-gray-500 menu-item-show:bg-primary-light menu-item-show:text-primary transition-colors">
              <span className="absolute top-1 right-1 w-2 md:w-2.5 h-2 md:h-2.5 bg-green-500 rounded-full animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 md:w-2.5 h-2 md:h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-coal-600"></span>
              <KeenIcon icon="notification" className="text-lg md:text-xl" />
            </div>
          </MenuToggle>

          {DropdownNotifications({ menuTtemRef: itemNotificationsRef })}
        </MenuItem>
      </Menu>

      <Menu className="items-stretch -me-2">
        <MenuItem
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [20, 0] 
                }
              }
            ]
          }}
        >
          <MenuToggle>
            <div className="btn btn-icon rounded-full hover:opacity-80 transition-opacity p-0.5">
              <img
                className="size-8 md:size-9 rounded-full border-2 border-success shrink-0 object-cover shadow-sm"
                src={persona?.rutaFotoUrl}
                alt={persona?.nombre || 'User'}
              />
            </div>
          </MenuToggle>
          {DropdownUser()}
        </MenuItem>
      </Menu>
    </div>
  );
};

export { HeaderTopbar };
