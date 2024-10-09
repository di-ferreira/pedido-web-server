'use client';
import { ResponseType } from '@/@types';
import { iFilter } from '@/@types/Filter';
import { iDataResultTable } from '@/@types/Table';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { headers } from './columns';
import { removeStorage } from '@/lib/utils';
import { KEY_NAME_TABLE_PAGINATION } from '@/constants';
import { iOrcamento } from '@/@types/Orcamento';
import { DataTable } from '@/components/CustomDataTable';
import { GetOrcamentosFromVendedor } from '@/app/actions/orcamento';

function DataTableBudget() {
  const [data, setData] = useState<ResponseType<iDataResultTable<iOrcamento>>>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const handleBudgets = useCallback((filter: iFilter<iOrcamento>) => {
    setLoading(true);
    GetOrcamentosFromVendedor(filter)
      .then((res) => {
        console.log('orçamentos:', res);

        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar clientes:', err);
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
    console.error('Erro ao carregar orçamentos:');
    return <span>Erro ao carregar orçamento: {data.error?.message}</span>;
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

export default DataTableBudget;

