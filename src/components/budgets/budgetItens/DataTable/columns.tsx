'use client';
import { iItensOrcamento } from '@/@types/Orcamento';
import { iColumnType } from '@/@types/Table';
import { removeItem } from '@/app/actions/orcamento';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { redirect } from 'next/navigation';

export const tableHeaders: iColumnType<iItensOrcamento>[] = [
  {
    key: 'acoes',
    title: 'AÇÕES',
    width: '15%',
    render: (_, item) => (
      <span className='flex w-full items-center justify-center gap-x-5'>
        <FontAwesomeIcon
          icon={faTrashAlt}
          className='cursor-pointer text-emsoft_blue-main hover:text-emsoft_blue-light'
          size='xl'
          title='Gerar Pré-venda'
          onClick={() => {
            console.log('remove table item', item.ORCAMENTO);
            removeItem(item);
            redirect(`/app/budgets/${item.ORCAMENTO}`);
          }}
        />
        <FontAwesomeIcon
          icon={faEdit}
          className='cursor-pointer text-emsoft_orange-main hover:text-emsoft_orange-light'
          size='xl'
          title='Editar'
        />
      </span>
    ),
  },
  {
    key: 'PRODUTO.PRODUTO',
    title: 'CÓDIGO',
    width: '15%',
  },
  {
    key: 'PRODUTO.REFERENCIA',
    title: 'REFERÊNCIA',
    width: '15%',
  },
  {
    key: 'PRODUTO.NOME',
    title: 'PRODUTO',
    width: '15%',
  },
  {
    key: 'PRODUTO.APLICACOES',
    title: 'APLICAÇÕES',
    width: '35%',
  },
  {
    key: 'PRODUTO.FABRICANTE.NOME',
    title: 'FABRICANTE',
    width: '15%',
  },
  {
    key: 'QTD',
    title: 'QTD',
    width: '5%',
  },
  {
    key: 'TOTAL',
    title: 'TOTAL',
    width: '15%',
    isHideMobile: true,
    render: (_, item) => {
      return item.TOTAL.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL',
      });
    },
  },
];

