import { cn } from '@/lib/utils';
import React, { JSX } from 'react';
import { iColumnType } from '../../../@types/Table';

interface iHeaderProps<T> {
  columns: iColumnType<T>[];
}

function TableHeader<T>({ columns }: iHeaderProps<T>): JSX.Element {
  return (
    <tr
      className={cn(
        'relative table-fixed w-screen h-8 max-sm:hidden max-sm:overflow-x-auto max-sm:overflow-y-hidden max-sm:h-full'
      )}
    >
      {columns.map((column, idx) => (
        <React.Fragment key={idx}>
          {
            <th
              className={cn(
                `font-semibold table-fixed text-center text-base pr-5 pl-0 flex-grow`,
                `max-sm:w-[${column.width ? column.width : 'auto'}]`,
                `overflow-hidden table-fixed border-b`,
                `${column.isHideMobile ? 'max-sm:hidden' : ''}`,
                ` max-sm:w-1/2 max-sm:items-center`
              )}
              key={`table-head-cell-${column.title}`}
              //   min_width={column.width}
            >
              {column.title}
            </th>
          }
        </React.Fragment>
      ))}
    </tr>
  );
}

export default TableHeader;

