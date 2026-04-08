import React from "react";

export const getTipoColor = (tipo: string): string => {
  switch (tipo) {
    case 'medica':
      return 'bg-primary-light text-primary border-primary';
    case 'fisioterapia':
      return 'bg-info-light text-info border-info';
    case 'odontologica':
      return 'bg-warning-light text-warning border-warning';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600';
  }
};

export const getTipoIcon = (tipo: string): React.ReactNode => {
  switch (tipo) {
    case 'medica':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'fisioterapia':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'odontologica':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 015 0H17" />
        </svg>
      );
    default:
      return null;
  }
};