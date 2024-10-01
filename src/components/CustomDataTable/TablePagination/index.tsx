/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';

import { iFilter } from '@/@types/Filter';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { loadStorage, saveStorage } from '@/lib/utils';
import { KEY_NAME_TABLE_PAGINATION } from '@/constants';
interface iDataTablePagination<T> {
  QuantityRegiters: number;
  OnFetchData: (filter: iFilter<T>) => void;
}

export type tpPaginationValues = {
  CurrentPage: number;
  RowsPerPage: number;
  TotalPages: number;
  TotalRegisters: number;
};

export function TablePagination<T>({
  QuantityRegiters,
  OnFetchData,
}: iDataTablePagination<T>): JSX.Element {
  const RowsPerPageOptions = [10, 20, 50, 100];
  const [PaginationOptions, setPaginationOptions] =
    useState<tpPaginationValues>({
      CurrentPage: 1,
      RowsPerPage: RowsPerPageOptions[0],
      TotalPages: 0,
      TotalRegisters: QuantityRegiters,
    });

  const SkipPage = (
    NextPage: boolean = true,
    RegPerPage: number = PaginationOptions.RowsPerPage
  ): number => {
    const CurPage = NextPage
      ? PaginationOptions.CurrentPage + 1
      : PaginationOptions.CurrentPage - 1;
    const Skip = RegPerPage * CurPage - RegPerPage;
    return Skip;
  };

  const ChangeRowsPerPage = (value: Number) => {
    const pagination = {
      ...PaginationOptions,
      RowsPerPage: Number(value),
    };
    setPaginationOptions(pagination);

    saveStorage<tpPaginationValues>(KEY_NAME_TABLE_PAGINATION, pagination);

    OnFetchData({
      top: value ? Number(value) : PaginationOptions.RowsPerPage,
      skip:
        PaginationOptions.RowsPerPage * PaginationOptions.CurrentPage -
        PaginationOptions.RowsPerPage,
    });
  };

  const GoToFirstPage = () => {
    const pagination = { ...PaginationOptions, CurrentPage: 1 };
    setPaginationOptions(pagination);
    saveStorage<tpPaginationValues>(KEY_NAME_TABLE_PAGINATION, pagination);
    OnFetchData({ top: PaginationOptions.RowsPerPage, skip: 0 });
  };

  const GoToNextPage = () => {
    if (PaginationOptions.CurrentPage < PaginationOptions.TotalPages) {
      const pagination = {
        ...PaginationOptions,
        CurrentPage: PaginationOptions.CurrentPage + 1,
      };
      setPaginationOptions(pagination);

      const top = PaginationOptions.RowsPerPage;
      const skip = SkipPage();

      saveStorage<tpPaginationValues>(KEY_NAME_TABLE_PAGINATION, pagination);
      OnFetchData({ top, skip });
    }
  };

  const GoToPrevPage = () => {
    if (PaginationOptions.CurrentPage < PaginationOptions.TotalPages) {
      const pagination = {
        ...PaginationOptions,
        CurrentPage: PaginationOptions.CurrentPage - 1,
      };
      setPaginationOptions((oldPage) => (oldPage = pagination));
      saveStorage<tpPaginationValues>(KEY_NAME_TABLE_PAGINATION, pagination);
      OnFetchData({ top: pagination.RowsPerPage, skip: SkipPage(false) });
    }
  };

  const GoToLastPage = () => {
    const pagination = {
      ...PaginationOptions,
      CurrentPage: PaginationOptions.TotalPages,
    };
    setPaginationOptions(pagination);
    saveStorage<tpPaginationValues>(KEY_NAME_TABLE_PAGINATION, pagination);
    OnFetchData({
      top: pagination.RowsPerPage,
      skip: pagination.TotalRegisters - pagination.RowsPerPage,
    });
  };

  useEffect(() => {
    const storagePagination = loadStorage<tpPaginationValues>(
      KEY_NAME_TABLE_PAGINATION
    );

    const newPagination: tpPaginationValues =
      storagePagination !== null
        ? {
            ...storagePagination,
            TotalPages: Math.ceil(
              storagePagination.TotalRegisters / storagePagination.RowsPerPage
            ),
          }
        : {
            CurrentPage: 1,
            RowsPerPage: RowsPerPageOptions[0],
            TotalPages: Math.ceil(QuantityRegiters / RowsPerPageOptions[0]),
            TotalRegisters: QuantityRegiters,
          };

    setPaginationOptions(
      (old) =>
        (old = {
          ...old,
          ...newPagination,
        })
    );
  }, []);

  return (
    <div className='flex w-screen items-center justify-around space-x-2 py-4'>
      <div className='flex w-1/2 items-center justify-center space-x-2 py-4'>
        <Label>Registros por página</Label>
        <Select
          defaultValue={String(PaginationOptions.RowsPerPage)}
          value={String(PaginationOptions.RowsPerPage)}
          onValueChange={(e: any) => {
            const selected = Number(e);
            setPaginationOptions({
              ...PaginationOptions,
              RowsPerPage: selected,
            });
            ChangeRowsPerPage(selected);
          }}
        >
          <SelectTrigger className='w-[70px] text-emsoft_dark-text'>
            {PaginationOptions.RowsPerPage}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {RowsPerPageOptions.map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                  className='text-emsoft_dark-text'
                >
                  Mostrar {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Label>
          <strong>{PaginationOptions.CurrentPage}</strong> de
          <strong>{PaginationOptions.TotalPages}</strong>
        </Label>
      </div>
      <div className='flex w-1/2 items-center justify-center space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          disabled={PaginationOptions.CurrentPage === 1}
          onClick={() => GoToPrevPage()}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={PaginationOptions.CurrentPage === 1}
          onClick={() => GoToFirstPage()}
        >
          First
        </Button>

        <Button
          variant='outline'
          size='sm'
          disabled={
            PaginationOptions.CurrentPage === PaginationOptions.TotalPages
          }
          onClick={() => GoToLastPage()}
        >
          Last
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={
            PaginationOptions.CurrentPage === PaginationOptions.TotalPages
          }
          onClick={() => GoToNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

