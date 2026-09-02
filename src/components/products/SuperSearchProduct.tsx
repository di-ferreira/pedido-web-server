'use client';
import { ResponseType } from '@/@types';
import { iFilter } from '@/@types/Filter';
import { iProduto } from '@/@types/Produto';
import { iDataResultTable } from '@/@types/Table';
import { GetProducts } from '@/app/actions/produto';
import useModal from '@/hooks/useModal';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Suspense, useEffect, useState } from 'react';
import { DataTable } from '../CustomDataTable';
import ToastNotify from '../ToastNotify';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { getProductTableHeaders } from './productTableHeaders';

interface iProps {
  data: iDataResultTable<iProduto>;
  words: string;
  CallBack?: (product: iProduto) => void;
}

const SuperSearchProducts = ({ data, words, CallBack }: iProps) => {
  const { OnCloseModal, showModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [Products, setProducts] = useState<iDataResultTable<iProduto>>(data);
  const [WordProducts, setWordProducts] = useState<string>(words);

  const tableHeaders = getProductTableHeaders({
    onAddProduct: (product) => {
      if (CallBack !== undefined) {
        OnCloseModal();
        CallBack(product);
      }
    },
  });

  function findProduct(filter: iFilter<iProduto>) {
    setLoading(true);
    GetProducts({
      top: filter.top,
      skip: filter.skip,
      orderBy: 'PRODUTO',
      filter: [
        {
          key: 'PRODUTO',
          value: WordProducts.toUpperCase(),
          typeSearch: 'like',
        },
        {
          key: 'REFERENCIA',
          value: WordProducts.toUpperCase(),
          typeSearch: 'like',
          typeCondition: 'or',
        },
        {
          key: 'NOME',
          value: WordProducts.toUpperCase(),
          typeSearch: 'like',
          typeCondition: 'or',
        },
        {
          key: 'APLICACOES',
          value: WordProducts.toUpperCase(),
          typeSearch: 'like',
          typeCondition: 'or',
        },
        {
          key: 'TRANCAR',
          value: 'N',
          typeCondition: 'and',
          typeSearch: 'eq',
        },
        { key: 'VENDA', value: 'S', typeCondition: 'and', typeSearch: 'eq' },
        { key: 'ATIVO', value: 'S', typeCondition: 'and', typeSearch: 'eq' },
      ],
    })
      .then(async (products: ResponseType<iDataResultTable<iProduto>>) => {
        if (products.value !== undefined) {
          const filteredProducts = products.value.value.filter(
            (p) => p.ATIVO !== 'N' && p.VENDA !== 'N' && p.TRANCAR !== 'S',
          );

          let listProducts: iProduto[] = filteredProducts.map((p) => {
            p.QTDATUAL = p.QTDATUAL - p.QTD_SEGURANCA;
            return p;
          });

          setProducts(
            (old) =>
              (old = {
                Qtd_Registros: listProducts.length,
                value: listProducts,
              }),
          );
        }

        if (products.error !== undefined) {
          ToastNotify({
            message: 'Error find Products' + products.error,
            type: 'error',
          });
        }
      })
      .catch((e) => {
        ToastNotify({
          message: 'Error find Products' + e,
          type: 'error',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const OnSearchProduto = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      findProduct({ top: 10, skip: 0 });
    }
  };

  useEffect(() => {
    setProducts(data);
    if (data.value.length > 0) {
      showModal();
    }
  }, [data]);

  return (
    <div className='flex flex-col gap-4 w-full h-[95%] p-2'>
      <div className='flex gap-x-2 w-full items-center'>
        <Input
          value={WordProducts}
          onChange={(e) => setWordProducts(e.target.value)}
          onKeyDown={OnSearchProduto}
        />
        <Button
          className={`flex w-fit h-[35px] p-3 gap-3`}
          title='Buscar Produto'
          onClick={() => findProduct({ top: 10, skip: 0 })}
        >
          <FontAwesomeIcon
            icon={faSearch}
            size='xl'
            title='Buscar'
            className='text-white'
          />
          Buscar
        </Button>
      </div>
      <div className='flex w-full h-full flex-col overflow-x-hidden overflow-y-auto'>
        {loading ? (
          <span>Carregando...</span>
        ) : (
          <Suspense fallback={<span>Carregando...</span>}>
            <DataTable
              columns={tableHeaders}
              TableData={Products.value}
              IsLoading={loading}
              QuantityRegiters={Products.Qtd_Registros}
              onFetchPagination={findProduct}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default SuperSearchProducts;
