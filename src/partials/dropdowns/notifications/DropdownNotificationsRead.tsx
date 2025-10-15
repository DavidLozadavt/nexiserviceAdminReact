import { useEffect, useRef, useState } from 'react';
import { getHeight } from '@/utils';
import { useViewport } from '@/hooks';
import {
  DropdownNotificationsItem7,
  DropdownNotificationsItem5,
  DropdownNotificationsItem8,
  DropdownNotificationsItem1,
  DropdownNotificationsItem3
} from './items';
import { Link } from 'react-router-dom';

const DropdownNotificationRead = ({ items }:any) => {
                   

  console.log(items)
  const footerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState<number>(0);
  const [viewportHeight] = useViewport();
  const offset = 300;

  useEffect(() => {
    if (footerRef.current) {
      const footerHeight = getHeight(footerRef.current);
      const availableHeight = viewportHeight - footerHeight - offset;
      setListHeight(availableHeight);
    }
  }, [viewportHeight]);

  const buildList = () => {
    return items.map((item: any, index: number) => {

      const {
        fecha,
        hora,
        mensaje,
        asunto,
        route,
        personaRemitente: { nombre1, apellido1, apellido2, rutaFotoUrl },
        empresa: { razonSocial },
        tipoNotificacion: { tipoNotificacion },
      } = item;
  
      return (
        <div key={item.id}>
          <div className="flex grow gap-2.5 px-5">
            <div className="relative shrink-0 mt-0.5">
              <img
                src={rutaFotoUrl || '/default-avatar.png'}
                className="rounded-full size-8"
                alt={`${nombre1} ${apellido1} avatar`}
              />
              <span className="size-1.5 badge badge-circle absolute top-7 end-0.5 ring-1 ring-light transform -translate-y-1/2"></span>
            </div>
  
            <div className="flex flex-col gap-1">
              <div className="mb-px font-medium text-2sm">
                <Link to="#" className="font-semibold text-gray-900 hover:text-primary-active">
                  {nombre1} {apellido1} {apellido2}
                </Link>
                <span className="text-gray-700"> {asunto} </span>
              </div>
              <span className="flex items-center font-medium text-gray-500 text-2xs">
                {fecha} - {hora}
                <span className="badge badge-circle bg-gray-500 size-1 mx-1.5"> </span>
                {razonSocial}
              </span>
            </div>
          </div>
  
          {index < items.length - 1 && (
            <div className="my-2 border-b border-b-gray-200"></div>
          )}
        </div>
      );
    });
  };

  const buildFooter = () => {
    return (
      <>
        <div className="border-b border-b-gray-200"></div>
        {/* <div className="grid grid-cols-2 p-5 gap-2.5">
          <button className="justify-center btn btn-sm btn-light">Archive all</button>
          <button className="justify-center btn btn-sm btn-light">Mark all as read</button>
        </div> */}
      </>
    );
  };

  return (
    <div className="grow">
      <div className="scrollable-y-auto" style={{ maxHeight: `${listHeight}px` }}>
        {buildList()}
      </div>
      <div ref={footerRef}>{buildFooter()}</div>
    </div>
  );
};

export { DropdownNotificationRead };
