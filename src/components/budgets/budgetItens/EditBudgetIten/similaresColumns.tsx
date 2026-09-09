import { iListaSimilare } from '@/@types/Produto';
import { iColumnType } from '@/@types/Table';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';

interface iSimilaresColumnsProps {
  onAddSimilar: (product: iListaSimilare) => void;
}

export const getSimilaresHeaders = ({
  onAddSimilar,
}: iSimilaresColumnsProps): iColumnType<iListaSimilare>[] => [
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
          onClick={() => onAddSimilar(item)}
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
    key: 'EQUIVALENTE',
    title: 'EQUIVALENTE',
    width: '15%',
  },
  {
    key: 'EXTERNO.DATA_ATUALIZACAO',
    title: 'DATA ATUALIZAÇÃO',
    width: '15%',
    render: (_, item) => {
      return dayjs(item.EXTERNO.DATA_ATUALIZACAO).format('DD/MM/YYYY');
    },
  },
  {
    key: 'EXTERNO.QTDATUAL',
    title: 'QTD ATUAL',
    width: '15%',
  },
];
