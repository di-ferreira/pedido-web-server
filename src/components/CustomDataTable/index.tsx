'use client';
import { iFilter } from '@/@types/Filter';
import { JSX } from 'react';
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
}: iTableDataProps<T>): JSX.Element {
  return (
    <table className='border-collapse border-none w-full table-fixed'>
      <thead className='w-full table-fixed'>
        <TableHeader columns={columns} />
      </thead>
      <tbody className='w-full relative table-fixed overflow-x-hidden overflow-y-auto max-sm:overflow-auto'>
        {IsLoading && <Loading />}

        {!IsLoading && <TableRow data={TableData} columns={columns} />}

        {ErrorMessage !== '' && (!TableData || TableData.length === 0) && (
          <div className='flex absolute w-[300px] top-5 left-[50%] translate-x-[-50%] items-center justify-center pl-14 pr-6'>
            <p>{ErrorMessage}</p>
          </div>
        )}
      </tbody>
      {onFetchPagination && QuantityRegiters && (
        <tfoot className='w-full table-fixed'>
          <TablePagination
            OnFetchData={onFetchPagination}
            QuantityRegiters={QuantityRegiters}
          />
        </tfoot>
      )}
    </table>
  );
}

