'use client';
import { iMovimento } from '@/@types/PreVenda';
import { iColumnType } from '@/@types/Table';
import dayjs from 'dayjs';

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
    isHideMobile: true,
    width: '20rem',
    render: (_, item) => {
      return dayjs(item.DATA).format('DD/MM/YYYY');
    },
  },
  {
    key: 'VENDEDOR.NOME',
    title: 'VENDEDOR',
    isHideMobile: true,
    width: '20rem',
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
  // {
  //   key: 'acoes',
  //   title: 'AÇÕES',
  //   width: '5rem',
  //   render: (_, item) => (
  //     <span className='flex w-full items-center justify-center gap-x-5'>
  //       <Link href={`/app/pre-sales/${item.MOVIMENTO}`}>
  //         <FontAwesomeIcon
  //           icon={faFileLines}
  //           className='text-emsoft_blue-main hover:text-emsoft_blue-light'
  //           size='xl'
  //           title='Gerar Pré-venda'
  //         />
  //       </Link>
  //     </span>
  //   ),
  // },
];

