import { cn } from '@/lib/utils';
import { iColumnType } from '../../../@types/Table';
import { TableRowCell } from '../TableRowCell';
import { TableRowHeaderCell } from '../TableRowHeaderCell';

interface iTableRowProps<T> {
  data: T[];
  columns: iColumnType<T>[];
}

function TableRow<T>({ data, columns }: iTableRowProps<T>) {
  return (
    <>
      {data &&
        data.map((item, idx) => (
          <tr
            className='relative w-screen cursor-auto max-sm:flex last:rounded-e odd:bg-gray-100 max-sm:flex-col  text-emsoft_dark-text h-14'
            key={`table-row-${idx}`}
          >
            {columns.map((column, columnIndex) => (
              <>
                <TableRowCell
                  key={`table-row-cell-${columnIndex}`}
                  item={item}
                  column={column}
                />
                <div
                  className={cn(
                    `hidden ${
                      column.isHideMobile ? 'max-sm:hidden' : 'max-sm:flex'
                    }`,
                    'min-sm:pl-10 border-b last:border-b-0'
                  )}
                >
                  <TableRowHeaderCell
                    key={`table-row-header-cell-${columnIndex}`}
                    item={item}
                    column={column}
                  />
                  <TableRowCell
                    key={`table-row-cell-${columnIndex}`}
                    item={item}
                    column={column}
                  />
                </div>
              </>
            ))}
          </tr>
        ))}
    </>
  );
}

export default TableRow;

