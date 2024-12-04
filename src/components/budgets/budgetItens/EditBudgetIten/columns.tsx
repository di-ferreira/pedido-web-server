'use client';
import { iListaChave } from '@/@types/Produto';
import { iColumnType } from '@/@types/Table';
import { faBan, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { iListaSimilare } from '../../../../@types/Produto';

const RenderIconBloqueado = (value: string): JSX.Element => {
  if (value === 'S')
    return <FontAwesomeIcon icon={faBan} className='text-red-700' size='xl' />;
  return (
    <FontAwesomeIcon icon={faCheck} className='text-green-800' size='xl' />
  );
};

export const tableChavesHeaders: iColumnType<iListaChave>[] = [
  {
    key: 'DATA_ATUALIZACAO',
    title: 'DATA ATUALIZACAO',
    width: '30%',
    render: (_, item) => {
      if (item.DATA_ATUALIZACAO === null) {
        return '00/00/0000';
      }
      return dayjs(item.DATA_ATUALIZACAO).format('DD/MM/YYYY');
    },
  },
  {
    key: 'CNA',
    title: 'DOC',
    width: '10%',
  },
  {
    key: 'Chave',
    title: 'CHAVE',
    width: '25%',
  },
];
export const tableSimilaresHeaders: iColumnType<iListaSimilare>[] = [
  {
    key: 'acoes',
    title: 'AÇÕES',
    width: '10%',
    render: (_, item) => (
      <span className='flex w-full items-center justify-center gap-x-5'>
        <FontAwesomeIcon
          icon={faPlus}
          className='cursor-pointer text-emsoft_orange-main hover:text-emsoft_orange-light'
          size='xl'
          title='Adicionar'
          onClick={() => {
            // CallBack && CallBack(item);
          }}
        />
      </span>
    ),
  },
  {
    key: 'EXTERNO.PRODUTO',
    title: 'PRODUTO',
    width: '10%',
  },
  {
    key: 'EXTERNO.NOME',
    title: 'NOME',
    width: '15%',
  },
  {
    key: 'EXTERNO.REFERENCIA',
    title: 'REFERÊNCIA',
    width: '15%',
  },
  {
    key: 'EXTERNO.DATA_ATUALIZACAO',
    title: 'DATA ATUALIZAÇÃO',
    width: '15%',
  },
  {
    key: 'EXTERNO.QTDATUAL',
    title: 'QTD ATUAL',
    width: '15%',
  },
];

