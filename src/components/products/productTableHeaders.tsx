import { iProduto } from '@/@types/Produto';
import { iColumnType } from '@/@types/Table';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface iProductTableHeadersProps {
  onAddProduct: (product: iProduto) => void;
}

export const getProductTableHeaders = ({
  onAddProduct,
}: iProductTableHeadersProps): iColumnType<iProduto>[] => [
  {
    key: 'acoes',
    title: 'AÇÕES',
    width: '10%',
    render: (_, item) => (
      <span className='flex w-full items-center justify-center gap-x-5'>
        <FontAwesomeIcon
          icon={faPlus}
          className='cursor-pointer text-emsoft_blue-main hover:text-emsoft_blue-light'
          size='xl'
          title='Adicionar'
          onClick={() => onAddProduct(item)}
        />
      </span>
    ),
  },
  {
    key: 'PRODUTO',
    title: 'CÓDIGO',
    width: '10%',
  },
  {
    key: 'REFERENCIA',
    title: 'REFERÊNCIA',
    width: '25%',
  },
  {
    key: 'NOME',
    title: 'NOME',
    width: '20%',
  },
  {
    key: 'APLICACOES',
    title: 'APLICAÇÕES',
    width: '35%',
  },
  {
    key: 'FABRICANTE.NOME',
    title: 'FABRICANTE',
    width: '35%',
  },
  {
    key: 'QTDATUAL',
    title: 'QTD',
    width: '10%',
  },
  {
    key: 'PRECO',
    title: 'VALOR',
    width: '10%',
    render: (_, item) => {
      return item.PRECO.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL',
      });
    },
  },
];
