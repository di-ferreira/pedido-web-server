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
import { iOption } from '../../../@types/Table';
interface iDataTablePagination<T> {
  QuantityRegiters: number;
  OnFetchData: (filter: iFilter<T>) => void;
}

export function TablePagination<T>({
  QuantityRegiters,
  OnFetchData,
}: iDataTablePagination<T>): JSX.Element {
  const RowsPerPageOptions = [10, 20, 50, 100];

  //   const [CurrentOption, setCurrentOption] = useState<iOption>(OptionsSelect[1]);

  const [CurrentPage, setCurrentPage] = useState<number>(1);
  const [RowsPerPage, setRowsPerPage] = useState<number>(15);
  const [TotalPages, setTotalPages] = useState<number>(1);
  const [TotalRegisters, setTotalRegisters] = useState<number>(1);

  const SkipPage = (
    NextPage: boolean = true,
    RegPerPage: number = RowsPerPage
  ): number => {
    const CurPage = NextPage ? CurrentPage + 1 : CurrentPage - 1;
    const Skip = RegPerPage * CurPage - RegPerPage;
    return Skip;
  };

  const ChangeRowsPerPage = (value: iOption) => {
    setRowsPerPage((oldValue) => {
      oldValue = Number(value.value);
      return oldValue;
    });

    OnFetchData({
      top: value ? Number(value.value) : RowsPerPage,
      skip: RowsPerPage * CurrentPage - RowsPerPage,
    });
  };

  const GoToFirstPage = () => {
    setCurrentPage(1);
    OnFetchData({ top: RowsPerPage, skip: 0 });
  };

  const GoToNextPage = () => {
    CurrentPage < TotalPages && setCurrentPage((oldPage) => oldPage + 1);

    OnFetchData({ top: RowsPerPage, skip: SkipPage() });
  };

  const GoToPrevPage = () => {
    CurrentPage < TotalPages && setCurrentPage((oldPage) => oldPage - 1);
    OnFetchData({ top: RowsPerPage, skip: SkipPage(false) });
  };

  const GoToLastPage = () => {
    setCurrentPage(TotalPages);
    OnFetchData({ top: RowsPerPage, skip: TotalRegisters - RowsPerPage });
  };

  useEffect(() => {
    setTotalPages(Math.ceil(QuantityRegiters / RowsPerPage));
    setTotalRegisters(QuantityRegiters);
    // const NewOption = OptionsSelect.find((opt) => opt.value === RowsPerPage);
    // setCurrentOption(NewOption || OptionsSelect[0]);
  }, [QuantityRegiters, RowsPerPage]);

  useEffect(() => {
    console.log(
      'pagination current, rowperpage, totalpages',
      CurrentPage,
      RowsPerPage,
      TotalPages
    );
  }, []);

  /*
  top = qtd registros por página
  skip = qtd de registro "pulados"
  currentPage = skip/top
  totalPages = total de páginas
  */
  return (
    <div className='flex w-screen items-center justify-around space-x-2 py-4'>
      <div className='flex w-1/2 items-center justify-center space-x-2 py-4'>
        <Label>Registros por página</Label>
        {/* <Select
                    value={CurrentOption}
                    menuPosition='top'
                    options={OptionsSelect}
                    onChange={(SingleValue) =>
                        SingleValue &&
                        ChangeRowsPerPage({
                            label: SingleValue.label,
                            value: SingleValue.value,
                        })
                    }
                /> */}
        <Label>
          <strong>{CurrentPage}</strong> de <strong>{TotalPages}</strong>
        </Label>
        <Label>Registros por página</Label>

        <Select
          defaultValue={String(RowsPerPage)}
          value={String(RowsPerPage)}
          onValueChange={(e: any) => {
            const selected = Number(e);
            setRowsPerPage(selected);
            // setPageIndex(0);
            //   externalFunction({
            //     skip: pageIndex,
            //     top: selected,
            //   });
          }}
        >
          <SelectTrigger className='w-[70px] text-emsoft_dark-text'>
            {RowsPerPage}
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
      </div>
      <div className='flex w-1/2 items-center justify-center space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          disabled={CurrentPage === 1}
          onClick={() => GoToPrevPage()}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={CurrentPage === 1}
          onClick={() => GoToFirstPage()}
        >
          First
        </Button>

        <Button
          variant='outline'
          size='sm'
          disabled={CurrentPage === TotalPages}
          onClick={() => GoToLastPage()}
        >
          Last
        </Button>
        <Button
          variant='outline'
          size='sm'
          disabled={CurrentPage === TotalPages}
          onClick={() => GoToNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

