import React, { ReactNode, memo } from 'react';

export interface TDataGridTableBodyCellProps {
  children: ReactNode;
  className?: string;
  id: string;
}

const DataGridTableBodyCellComponent = ({ id, children, className }: TDataGridTableBodyCellProps) => {
  return (
    <td key={id} className={className && className}>
      {children}
    </td>
  );
};

const DataGridTableBodyCell = memo(DataGridTableBodyCellComponent);

export { DataGridTableBodyCell };
