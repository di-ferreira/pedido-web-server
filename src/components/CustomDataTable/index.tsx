'use client';
import { iFilter } from '@/@types/Filter';
import { iColumnType } from '../../@types/Table';
import { Loading } from '../Loading';
import TableHeader from './TableHeader';
import { TablePagination } from './TablePagination';
import TableRow from './TableRow';

type iTableDataProps<T> = {
  ErrorMessage?: string;
  columns: iColumnType<T>[];
  TableData: T[];
  QuantityRegiters?: number;
  IsLoading: boolean;
  onFetchPagination?: (filter: iFilter<T>) => void;
};

export function DataTable<T>({
  columns,
  TableData,
  ErrorMessage,
  onFetchPagination,
  QuantityRegiters,
  IsLoading,
}: iTableDataProps<T>) {
  return (
    <div className='w-full overflow-x-auto relative'>
      {IsLoading && (
        <div className='w-full flex items-center justify-center py-10'>
          <Loading />
        </div>
      )}

      {!IsLoading && (
        <table className='border-collapse relative border-none w-full min-w-[600px] table-fixed'>
          <thead className='w-full table-fixed'>
            <TableHeader columns={columns} />
          </thead>
          <tbody className='w-full table-fixed'>
            {ErrorMessage !== '' && !TableData && (
              <tr>
                <td colSpan={columns.length} className='text-center py-5'>
                  {ErrorMessage}
                </td>
              </tr>
            )}
            {TableData && TableData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className='text-center py-5'>
                  Não há registros
                </td>
              </tr>
            )}
            {!IsLoading && <TableRow data={TableData} columns={columns} />}
          </tbody>
          {onFetchPagination &&
            QuantityRegiters !== undefined &&
            QuantityRegiters > 0 && (
              <TablePagination
                OnFetchData={onFetchPagination}
                QuantityRegiters={QuantityRegiters}
                rowsQtd={columns.length}
              />
            )}
        </table>
      )}
    </div>
  );
}

