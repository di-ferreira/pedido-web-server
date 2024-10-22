import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { get } from 'lodash';
import { JSX } from 'react';
import { iButtonAction, iColumnType } from '../../../@types/Table';
import React from 'react';

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
            'pr-5 pl-0 text-xs text-center text-wrap flex-grow capitalize text-emsoft_dark-text max-w-36',
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
              {column.action.map((button: iButtonAction<T>, i) => (
                <Button
                  title={button.Title}
                  className={cn(
                    ' text-2xl text-center  capitalize',
                    button.Color !== undefined &&
                      (`${
                        button.Color.text
                          ? button.Color.text
                          : 'text-emsoft_blue-main'
                      }`,
                      `${
                        button.Color.background
                          ? button.Color.background
                          : 'bg-transparent'
                      }`,
                      `${
                        button.Color.backgroundHover
                          ? button.Color.backgroundHover
                          : 'hover:bg-transparent'
                      }`,
                      `${
                        button.Color.hover
                          ? `hover:${button.Color.hover}`
                          : 'hover:text-emsoft_blue-light'
                      }`),
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

