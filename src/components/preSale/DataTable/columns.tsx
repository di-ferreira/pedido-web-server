'use client';
import { iMovimento } from '@/@types/PreVenda';
import { iColumnType } from '@/@types/Table';
import dayjs from 'dayjs';
import { LuBox } from 'react-icons/lu';
import { TbTruck } from 'react-icons/tb';

export const headers: iColumnType<iMovimento>[] = [
  {
    key: 'MOVIMENTO',
    title: 'PRÉ-VENDA',
    width: '5rem',
  },
  {
    key: 'CLIENTE.NOME',
    title: 'NOME',
    width: '20rem',
  },
  {
    key: 'DATA',
    title: 'DATA',
    width: '20rem',
    render: (_, item) => {
      return dayjs(item.DATA).format('DD/MM/YYYY');
    },
  },
  {
    key: 'VENDEDOR.NOME',
    title: 'VENDEDOR',
    width: '20rem',
  },
  {
    key: 'COM_FRETE',
    title: 'FRETE',
    width: '20rem',
    render: (_, item) => (
      <span className='flex w-full items-center justify-center gap-x-5'>
        {item.COM_FRETE === 'S' ? (
          <TbTruck size={30} className='text-emsoft_orange-dark' />
        ) : (
          <LuBox size={30} className='text-emsoft_orange-dark' />
        )}
      </span>
    ),
  },
  {
    key: 'TOTAL',
    title: 'TOTAL',
    width: '7rem',
    render: (_, item) => {
      return item.TOTAL.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL',
      });
    },
  },
];

