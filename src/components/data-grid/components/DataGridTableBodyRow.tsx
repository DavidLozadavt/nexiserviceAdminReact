import React, { ReactNode, memo } from 'react';
import { DataGridTableBodyRowSelect, useDataGrid } from '..';

export interface TDataGridTableBodyRowProps {
  children: ReactNode;
  className?: string;
  id: string;
}

const DataGridTableBodyRowComponent = ({ id, children, className }: TDataGridTableBodyRowProps) => {
  const { props } = useDataGrid();

  return (
    <tr className={className && className}>
      {props.rowSelect && <DataGridTableBodyRowSelect id={id} />}
      {children}
    </tr>
  );
};

const DataGridTableBodyRow = memo(DataGridTableBodyRowComponent);

export { DataGridTableBodyRow };
