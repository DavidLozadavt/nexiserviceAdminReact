export type CategoryKey =
  | 'TIENDA'
  | 'BARBERIAS'
  | 'RESTAURANTES'
  | 'HOTEL'
  | 'CONSULTORIO'
  | 'otros';

interface CategoryStyles {
  primary: string;
  primaryHover: string;
  text: string;
  card: string;
  cardHover: string;
  button: string;
  buttonSelect: string;
  price: string;
  shadow: string;
  shadowHover: string;
  tableHeader: string;
  tableRow: string;
  tableBorder: string;
  input: string;
  textarea: string;
  select: string;
}

export const categoryStyles: Record<CategoryKey, CategoryStyles> = {
  TIENDA: {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    text: 'text-blue-600 dark:text-blue-400',
    card: 'bg-white dark:bg-neutral-900',
    cardHover: 'hover:shadow-blue-400/40',
    shadow: 'shadow-md',
    shadowHover: 'hover:shadow-lg',
    button: 'bg-blue-600 text-white',
    buttonSelect: 'bg-gray-200 dark:bg-neutral-800 text-neutral-900 dark:text-white',
    price: 'text-blue-600 dark:text-blue-400',
    tableHeader: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-semibold',
    tableRow: 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50',
    tableBorder: 'border border-neutral-200 dark:border-neutral-700 rounded-xl',
    input:
      'bg-white dark:bg-neutral-800 border border-blue-400 dark:border-blue-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none transition',
    textarea:
      'bg-white dark:bg-neutral-800 border border-blue-400 dark:border-blue-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none',
    select:
      'bg-white dark:bg-neutral-800 border border-blue-400 dark:border-blue-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 outline-none transition'
  },
  BARBERIAS: {
    primary: 'bg-red-600',
    primaryHover: 'hover:bg-red-700',
    text: 'text-red-600 dark:text-red-400',
    card: 'bg-white dark:bg-neutral-900',
    cardHover: 'hover:shadow-red-400/40',
    shadow: 'shadow-md',
    shadowHover: 'hover:shadow-lg',
    button: 'bg-red-600 text-white',
    buttonSelect: 'bg-gray-200 dark:bg-neutral-800 text-neutral-900 dark:text-white',
    price: 'text-red-600 dark:text-red-400',
    tableHeader: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 font-semibold',
    tableRow: 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50',
    tableBorder: 'border border-neutral-200 dark:border-neutral-700 rounded-xl',
    input:
      'bg-white dark:bg-neutral-800 border border-red-400 dark:border-red-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-red-500 outline-none transition',
    textarea:
      'bg-white dark:bg-neutral-800 border border-red-400 dark:border-red-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-red-500 outline-none transition resize-none',
    select:
      'bg-white dark:bg-neutral-800 border border-red-400 dark:border-red-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-red-500 outline-none transition'
  },
  RESTAURANTES: {
    primary: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    text: 'text-orange-600 dark:text-orange-400',
    card: 'bg-white dark:bg-neutral-900',
    cardHover: 'hover:shadow-orange-400/40',
    shadow: 'shadow-md',
    shadowHover: 'hover:shadow-lg',
    button: 'bg-orange-600 text-white',
    buttonSelect: 'bg-gray-200 dark:bg-neutral-800 text-neutral-900 dark:text-white',
    price: 'text-orange-600 dark:text-orange-400',
    tableHeader:
      'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 font-semibold',
    tableRow: 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50',
    tableBorder: 'border border-neutral-200 dark:border-neutral-700 rounded-xl',
    input:
      'bg-white dark:bg-neutral-800 border border-orange-400 dark:border-orange-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-orange-500 outline-none transition',
    textarea:
      'bg-white dark:bg-neutral-800 border border-orange-400 dark:border-orange-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-orange-500 outline-none transition resize-none',
    select:
      'bg-white dark:bg-neutral-800 border border-orange-400 dark:border-orange-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-orange-500 outline-none transition'
  },
  HOTEL: {
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    text: 'text-purple-600 dark:text-purple-400',
    card: 'bg-white dark:bg-neutral-900',
    cardHover: 'hover:shadow-purple-400/40',
    shadow: 'shadow-md',
    shadowHover: 'hover:shadow-lg',
    button: 'bg-purple-600 text-white',
    buttonSelect: 'bg-gray-200 dark:bg-neutral-800 text-neutral-900 dark:text-white',
    price: 'text-purple-600 dark:text-purple-400',
    tableHeader:
      'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 font-semibold',
    tableRow: 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50',
    tableBorder: 'border border-neutral-200 dark:border-neutral-700 rounded-xl',
    input:
      'bg-white dark:bg-neutral-800 border border-purple-400 dark:border-purple-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-purple-500 outline-none transition',
    textarea:
      'bg-white dark:bg-neutral-800 border border-purple-400 dark:border-purple-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-purple-500 outline-none transition resize-none',
    select:
      'bg-white dark:bg-neutral-800 border border-purple-400 dark:border-purple-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-purple-500 outline-none transition'
  },
  CONSULTORIO: {
    primary: 'bg-sky-600',
    primaryHover: 'hover:bg-sky-700',
    text: 'text-sky-600 dark:text-sky-400',
    card: 'bg-white dark:bg-neutral-900',
    cardHover: 'hover:shadow-sky-400/40',
    shadow: 'shadow-md',
    shadowHover: 'hover:shadow-lg',
    button: 'bg-sky-600 text-white',
    buttonSelect: 'bg-gray-200 dark:bg-neutral-800 text-neutral-900 dark:text-white',
    price: 'text-sky-600 dark:text-sky-400',
    tableHeader: 'bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-300 font-semibold',
    tableRow: 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50',
    tableBorder: 'border border-neutral-200 dark:border-neutral-700 rounded-xl',
    input:
      'bg-white dark:bg-neutral-800 border border-sky-400 dark:border-sky-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-sky-500 outline-none transition',
    textarea:
      'bg-white dark:bg-neutral-800 border border-sky-400 dark:border-sky-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-sky-500 outline-none transition resize-none',
    select:
      'bg-white dark:bg-neutral-800 border border-sky-400 dark:border-sky-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-sky-500 outline-none transition'
  },
  otros: {
    primary: 'bg-gray-600',
    primaryHover: 'hover:bg-gray-700',
    text: 'text-gray-600 dark:text-gray-400',
    card: 'bg-white dark:bg-neutral-900',
    cardHover: 'hover:shadow-gray-400/40',
    shadow: 'shadow-md',
    shadowHover: 'hover:shadow-lg',
    button: 'bg-gray-600 text-white',
    buttonSelect: 'bg-gray-200 dark:bg-neutral-800 text-neutral-900 dark:text-white',
    price: 'text-gray-600 dark:text-gray-400',
    tableHeader: 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-300 font-semibold',
    tableRow: 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50',
    tableBorder: 'border border-neutral-200 dark:border-neutral-700 rounded-xl',
    input:
      'bg-white dark:bg-neutral-800 border border-gray-400 dark:border-gray-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-gray-500 outline-none transition',
    textarea:
      'bg-white dark:bg-neutral-800 border border-gray-400 dark:border-gray-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-gray-500 outline-none transition resize-none',
    select:
      'bg-white dark:bg-neutral-800 border border-gray-400 dark:border-gray-600 rounded-xl px-4 py-2 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-gray-500 outline-none transition'
  }
};
