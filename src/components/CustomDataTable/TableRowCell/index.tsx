import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { get } from 'lodash';
import { JSX } from 'react';
import { iColumnType } from '../../../@types/Table';

interface iTableCellProps<T> {
  item: T;
  column: iColumnType<T>;
}

export function TableRowCell<T>({
  item,
  column,
}: iTableCellProps<T>): JSX.Element {
  const value = get(item, column.key);
  return (
    <>
      {
        <td
          className={cn(
            'pr-5 pl-0 text-xs text-center text-wrap flex-grow capitalize text-emsoft_dark-text',
            `${column.width ? `w-[${column.width}]` : 'w-min'}`,
            `max-sm:w-[${column.width ? column.width : 'auto'}]`,
            `overflow-hidden table-fixed border-b`,
            `${column.isHideMobile ? 'max-sm:hidden' : ''}`,
            ` max-sm:w-1/2 max-sm:items-center`
          )}
          //isHideMobile={column.isHideMobile} min_width={column.width}
        >
          {column.action ? (
            <span className='flex items-center justify-evenly'>
              {column.action.map((button, i) => (
                <Button
                  className='w-12 h-12 rounded-full text-emsoft_dark-text'
                  key={i}
                  onClick={() => button.onclick(item)}
                >
                  {button.Text}
                </Button>
                // <Button
                //   Icon={button.Icon}
                //   onclick={() => button.onclick(item)}
                //   Height='3rem'
                //   Width='3rem'
                //   Title={button.Title}
                //   Rounded={button.Rounded}
                //   Type={button.Type}
                //   Size={button.Size}
                //   Text={button.Text}
                //   key={i}
                // />
              ))}
            </span>
          ) : column.render ? (
            column.render(column, item)
          ) : (
            value
          )}
        </td>
      }
    </>
  );
}

