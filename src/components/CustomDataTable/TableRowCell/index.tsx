import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { get } from 'lodash';
import { JSX } from 'react';
import { iButtonAction, iColumnType } from '../../../@types/Table';

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
            'pr-5 pl-0 text-xs text-center overflow-hidden whitespace-nowrap flex-grow text-ellipsis capitalize h-full max-h-[45px] text-emsoft_dark-text max-w-36',
            `${column.width ? `w-[${column.width}]` : 'w-min'}`,
            `max-sm:w-[${column.width ? column.width : 'auto'}]`,
            ` table-fixed border-b`,
            `${column.isHideMobile ? 'max-sm:hidden' : ''}`,
            ` max-sm:w-1/2 max-sm:items-center`
          )}
        >
          {column.action ? (
            <span className='flex items-center justify-evenly'>
              {column.action.map((button: iButtonAction<T>, i) => (
                <Button
                  title={button.Title}
                  className={cn(
                    ' text-2xl text-center  capitalize text-emsoft_blue-main bg-transparent hover:bg-transparent hover:text-emsoft_blue-light',
                    `${button.Color.text}`,
                    `${button.Color.background}`,
                    `${button.Color.backgroundHover}`,
                    `${button.Color.hover}`,
                    `${button.Rounded ? ` rounded-full ` : 'rounded-sm'}`
                  )}
                  key={i}
                  onClick={() => button.onclick(item)}
                >
                  {button.Icon ? <FontAwesomeIcon icon={button.Icon} /> : ''}
                  {button.Text}
                </Button>
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

