'use client';
import { iCliente } from '@/@types/Cliente';
import { iOrcamento } from '@/@types/Orcamento';
import { iColumnType } from '@/@types/Table';
import { MaskCnpjCpf } from '@/lib/utils';
import {
  faBan,
  faCheck,
  faEdit,
  faFileLines,
  faUserAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import dayjs from 'dayjs';

const RenderIconBloqueado = (value: string): JSX.Element => {
  if (value === 'S')
    return <FontAwesomeIcon icon={faBan} className='text-red-700' size='xl' />;
  return (
    <FontAwesomeIcon icon={faCheck} className='text-green-800' size='xl' />
  );
};

export const headers: iColumnType<iOrcamento>[] = [
  {
    key: 'ORCAMENTO',
    title: 'ORCAMENTO',
    width: '10%',
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
    isHideMobile: true,
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
  {
    key: 'acoes',
    title: 'AÇÕES',
    width: '5rem',
    render: (_, item) => (
      <span className='flex w-full items-center justify-center gap-x-5'>
        <Link href={`/app/pre-sales/${item.ORCAMENTO}`}>
          <FontAwesomeIcon
            icon={faFileLines}
            className='text-emsoft_blue-main hover:text-emsoft_blue-light'
            size='xl'
            title='Gerar Pré-venda'
          />
        </Link>

        <Link href={`/app/budgets/${item.ORCAMENTO}`}>
          <FontAwesomeIcon
            icon={faEdit}
            className='text-emsoft_orange-main hover:text-emsoft_orange-light'
            size='xl'
            title='Editar'
          />
        </Link>
      </span>
    ),
  },
];

