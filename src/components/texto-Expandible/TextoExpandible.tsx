import React, { useState } from 'react';

interface Props {
  text: string;
  maxLength?: number;
}

const TextoExpandible: React.FC<Props> = ({ text, maxLength = 60 }) => {
  const [open, setOpen] = useState(false);

  if (text.length <= maxLength) {
    return <div className="text-gray-700">{text}</div>;
  }

  return (
    <span className="text-gray-700 inline-block whitespace-normal break-words max-w-[400px]">
      {open ? text : text.substring(0, maxLength) + '...'}
      <button
        onClick={() => setOpen(!open)}
        className="ml-1 text-blue-600 hover:underline"
      >
        {open ? 'Ver menos' : 'Ver más'}
      </button>
    </span>
  );
};
export default TextoExpandible;