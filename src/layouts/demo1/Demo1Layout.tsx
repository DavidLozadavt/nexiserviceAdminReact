import useBodyClasses from '@/hooks/useBodyClasses';
import { Demo1LayoutProvider, Main } from './';

const Demo1Layout = () => {
  // Using the useBodyClasses hook to set background styles for light and dark modes
  useBodyClasses(`
    [--tw-page-bg:#ffffff] 
    [--tw-page-bg-dark:#09090b] 
    bg-[--tw-page-bg] 
    dark:bg-[--tw-page-bg-dark]
  `);

  return (
    <Demo1LayoutProvider>
      <Main />
    </Demo1LayoutProvider>
  );
};

export { Demo1Layout };
