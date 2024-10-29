'use client';
import { iListaChave } from '@/@types/Produto';
import { iColumnType } from '@/@types/Table';
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';

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

