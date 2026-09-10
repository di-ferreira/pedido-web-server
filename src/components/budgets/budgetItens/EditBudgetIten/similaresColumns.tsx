import { iListaSimilare } from '@/@types/Produto';
import { iColumnType } from '@/@types/Table';
import { FormatToCurrency } from '@/lib/utils';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface iSimilaresColumnsProps {
  onAddSimilar: (product: iListaSimilare) => void;
  priceRatio: number;
}

export const getSimilaresHeaders = ({
  onAddSimilar,
  priceRatio,
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
    width: '20%',
  },
  {
    key: 'EXTERNO.REFERENCIA',
    title: 'REFERÊNCIA',
    width: '20%',
  },
  {
    key: 'preco',
    title: 'PREÇO',
    width: '20%',
    render: (_, item) =>
      FormatToCurrency((item.EXTERNO.PRECO * priceRatio).toFixed(2)),
  },
  {
    key: 'EXTERNO.QTDATUAL',
    title: 'QTD ATUAL',
    width: '20%',
  },
];
