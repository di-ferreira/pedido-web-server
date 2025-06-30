'use client';
import { iSearch, ResponseType } from '@/@types';
import { iFilter } from '@/@types/Filter';
import { iProduto } from '@/@types/Produto';
import { iDataResultTable } from '@/@types/Table';
import { GetProducts } from '@/app/actions/produto';
import { DataTable } from '@/components/CustomDataTable';
import ErrorMessage from '@/components/ErrorMessage';
import Filter from '@/components/Filter';
import { Loading } from '@/components/Loading';
import { KEY_NAME_TABLE_PAGINATION } from '@/constants';
import { removeStorage } from '@/lib/utils';
import { Suspense, useEffect, useState } from 'react';
import { headers } from './columns';

function DataTableProducts() {
  const [data, setData] = useState<ResponseType<iDataResultTable<iProduto>>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [WordProducts, setWordProducts] = useState<string>('');

  const handleProductSearch = (filter: iSearch<iProduto>) => {
    console.log('handleProductSearch', filter);
    setLoading(true);
    setWordProducts(filter.value);

    GetProducts({
      top: 15,
      skip: 0,
      orderBy: 'PRODUTO',
      filter: [
        {
          key: 'PRODUTO',
          value: WordProducts,
          typeSearch: 'like',
        },
        {
          key: 'REFERENCIA',
          value: WordProducts,
          typeCondition: 'or',
          typeSearch: 'like',
        },
      ],
    })
      .then(async (products: ResponseType<iDataResultTable<iProduto>>) => {
        console.log('handleProductSearch products', products);

        if (products.value !== undefined) {
          console.log('handleProductSearch GetProduct', products.value);
          setData((old) => (old = products));
        }

        if (products.error !== undefined)
          console.error('Error find Products', products.error);
      })
      .catch((e) => {
        console.error('Error find Products', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleProduct = (filter: iFilter<iProduto>) => {
    console.log('handleProduct', filter);

    setLoading(true);

    GetProducts({
      top: filter.top,
      skip: filter.skip,
      orderBy: 'PRODUTO',
      filter: [
        {
          key: 'PRODUTO',
          value: WordProducts,
          typeSearch: 'like',
        },
        {
          key: 'REFERENCIA',
          value: WordProducts,
          typeCondition: 'or',
          typeSearch: 'like',
        },
      ],
    })
      .then(async (products: ResponseType<iDataResultTable<iProduto>>) => {
        console.log('products', products);

        if (products.value !== undefined) {
          console.log('GetProduct', products.value);
          setData((old) => (old = products));
        }

        if (products.error !== undefined)
          console.error('Error find Products', products.error);
      })
      .catch((e) => {
        console.error('Error find Products', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    removeStorage(KEY_NAME_TABLE_PAGINATION);
    handleProduct({ top: 10 });
  }, []);

  if (data.error !== undefined) {
    return (
      <ErrorMessage
        title='Erro ao carregar Produtos'
        message={`${data.error.message}`}
      />
    );
  }

  return (
    <section className='flex flex-col gap-x-5 w-full'>
      <Filter onSearch={handleProductSearch} />
      <Suspense fallback={<Loading />}>
        <DataTable
          columns={headers}
          TableData={data.value?.value!}
          QuantityRegiters={data.value?.Qtd_Registros}
          onFetchPagination={handleProduct}
          IsLoading={loading}
        />
      </Suspense>
    </section>
  );
}

export default DataTableProducts;

