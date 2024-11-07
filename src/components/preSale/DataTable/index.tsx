'use client';
import { ResponseType } from '@/@types';
import { iFilter } from '@/@types/Filter';
import { iMovimento } from '@/@types/PreVenda';
import { iDataResultTable } from '@/@types/Table';
import { GetPreVendas } from '@/app/actions/preVenda';
import { DataTable } from '@/components/CustomDataTable';
import { KEY_NAME_TABLE_PAGINATION } from '@/constants';
import { removeStorage } from '@/lib/utils';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { headers } from './columns';

function DataTablePreSale() {
  const [data, setData] = useState<ResponseType<iDataResultTable<iMovimento>>>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const handleBudgets = useCallback((filter: iFilter<iMovimento>) => {
    setLoading(true);
    GetPreVendas(filter)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar Pré-vendas:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    removeStorage(KEY_NAME_TABLE_PAGINATION);
    handleBudgets({ top: 10 });
  }, []);

  if (loading) {
    return <span>Carregando...</span>;
  }

  if (data.value === undefined) {
    console.error('Erro ao carregar Pré-vendas:');
    return <span>Erro ao carregar Pré-vendas: {data.error?.message}</span>;
  }

  return (
    <section className='flex flex-col gap-x-5 w-full'>
      <Suspense fallback={<span>Carregando...</span>}>
        <DataTable
          columns={headers}
          TableData={data.value.value}
          QuantityRegiters={data.value.Qtd_Registros}
          onFetchPagination={handleBudgets}
          IsLoading={loading}
        />
      </Suspense>
    </section>
  );
}

export default DataTablePreSale;

