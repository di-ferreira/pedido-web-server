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

interface FilterProps<T, K> {
  options?: { key: string; value: K }[];
  onSearch?: (filter: iFilter<T>) => void;
}

function Filter<T, K>({ options }: FilterProps<T, K>): JSX.Element {
  return (
    <div className='flex justify-center items-center w-full min-h-10 overflow-hidden'>
      {options && (
        <Select
          defaultValue={String(options[0].value)}
          value={String(options[0].value)}
          onValueChange={(e: any) => {
            console.log('value changed to:', String(e));
          }}
        >
          <SelectTrigger className='w-fit text-emsoft_dark-text'>
            {options[0].key}
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
          onChange={(e) => {
            console.log('Change Input');
          }}
          value={''}
          placeholder='Digite sua busca'
          className='w-[25rem] h-16'
        />
      </div>

      <Button
        className='ml-3 h-10'
        variant='secondary'
        size='sm'
        onClick={() => console.log('Search')}
      >
        Buscar
      </Button>
    </div>
  );
}

export default Filter;

