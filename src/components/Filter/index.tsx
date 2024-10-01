'use client';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { iFilter } from '../../@types/Filter';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '../ui/select';
import { useState } from 'react';
import { loadStorage } from '@/lib/utils';
import { tpPaginationValues } from '../CustomDataTable/TablePagination';
import { iSearch } from '@/@types';

interface FilterProps<T, K> {
  options: { key: string; value: K }[];
  onSearch: (params: iSearch<T>) => void;
}
interface iFilterOptions<T, K> {
  value: K;
  key: string;
}

function Filter<T, K>({ options, onSearch }: FilterProps<T, K>): JSX.Element {
  const [FilterOptions, setFilterOptions] = useState<iFilterOptions<T, K>>({
    value: options[0].value,
    key: options[0].key,
  });

  const [SearchInput, setSearchInput] = useState<string>('');

  return (
    <div className='flex justify-center items-center w-full min-h-10 overflow-hidden'>
      {options && (
        <Select
          defaultValue={String(options[0].value)}
          value={String(FilterOptions.value)}
          onValueChange={(e: any) => {
            const selected = options.find((opt) => opt.value === e);
            setFilterOptions((old) => {
              return selected ? (old = selected) : old;
            });
          }}
        >
          <SelectTrigger className='w-fit text-emsoft_dark-text'>
            {FilterOptions.key}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((opt) => (
                <SelectItem
                  key={opt.key}
                  value={String(opt.value)}
                  className='text-emsoft_dark-text'
                >
                  {opt.key}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      <div className='w-96 mr-0 ml-2'>
        <Input
          onChange={(e) => setSearchInput((old) => (old = e.target.value))}
          value={SearchInput}
          placeholder='Digite sua busca'
          className='w-[25rem] h-16'
        />
      </div>

      <Button
        className='ml-3 h-10'
        variant='secondary'
        size='sm'
        onClick={() =>
          onSearch({
            filterBy: FilterOptions.value,
            value: SearchInput,
          } as iSearch<T>)
        }
      >
        Buscar
      </Button>
    </div>
  );
}

export default Filter;

