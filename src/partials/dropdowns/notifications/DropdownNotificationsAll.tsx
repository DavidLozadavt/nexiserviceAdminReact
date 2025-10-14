import { useEffect, useRef, useState } from 'react';
import { getHeight } from '@/utils';
import { useViewport } from '@/hooks';


import { Link } from 'react-router-dom';
const DropdownNotificationsAll = ({ items }: any) => {

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


            <div className="flex flex-col gap-1">
              <div className="mb-px font-medium text-2sm">
                <Link to="#" className="font-semibold text-gray-900 hover:text-primary-active">
                  {nombre1} {apellido1} {apellido2}
                </Link>
                <div className="font-semibold text-gray-800">
                  {asunto}
                </div>
                <div className="text-sm text-gray-600">
                  {mensaje}
                </div>


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

export { DropdownNotificationsAll };
