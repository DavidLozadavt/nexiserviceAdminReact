import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { toAbsoluteUrl } from '@/utils/Assets';

import { CommonAvatars } from '@/partials/common';

interface IEntryCalloutProps {
  className: string;
}

const EntryCallout = ({ className }: IEntryCalloutProps) => {
  return (
    <Fragment>
      <style>
        {`
          .entry-callout-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/2.png')}');
          }
          .dark .entry-callout-bg {
            background-image: url('${toAbsoluteUrl('/media/images/2600x1600/2-dark.png')}');
          }
        `}
      </style>

      <div className={`card h-full ${className}`}>
        <div className="card-body p-10 bg-[length:80%] [background-position:175%_25%] bg-no-repeat entry-callout-bg">
          <div className="flex flex-col justify-center gap-4">
            <CommonAvatars
              size="size-10"
              group={[
                { filename: '300-4.png' },
                { filename: '300-1.png' },
                { filename: '300-2.png' },
                {
                  fallback: 'S',
                  variant: 'text-success-inverse text-xs ring-success-light bg-success'
                }
              ]}
            />

            <h2 className="text-1.5xl font-semibold text-gray-900">
              Bienvenido al Panel <br />
              de {' '}
              <span className="text-primary">
                NexiService
              </span>
            </h2>

            <p className="text-sm font-normal text-gray-700 leading-5.5">
              Administre sus servicios, inventario y clientes de manera eficiente. <br />
              Acceda a todas las herramientas integradas para optimizar su flujo de trabajo <br />
              y mejorar la productividad de su empresa.
            </p>
          </div>
        </div>

        <div className="card-footer justify-center">
          <Link to="/perfil" className="btn btn-link">
            Mi Perfil
          </Link>
        </div>
      </div>
    </Fragment>
  );
};

export { EntryCallout, type IEntryCalloutProps };
