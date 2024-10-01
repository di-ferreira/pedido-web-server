'use client';
import { iSearch, ResponseType } from '@/@types';
import { iCliente } from '@/@types/Cliente';
import { iFilter, iFilterQuery } from '@/@types/Filter';
import { iDataResultTable } from '@/@types/Table';
import { GetClienteFromVendedor } from '@/app/actions/cliente';
import { DataTable } from '@/components/CustomDataTable';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { headers } from './columns';
import Filter from '@/components/Filter';
import { removeStorage } from '@/lib/utils';
import { KEY_NAME_TABLE_PAGINATION } from '@/constants';

function DataTableCustomer() {
  const [data, setData] = useState<ResponseType<iDataResultTable<iCliente>>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const filterValues = [
    { key: 'NOME', value: 'NOME' },
    { key: 'CÓDIGO', value: 'CLIENTE' },
    { key: 'CPF/CNPJ', value: 'CIC' },
    { key: 'BAIRRO', value: 'BAIRRO' },
    { key: 'CIDADE', value: 'CIDADE' },
  ];

  const MountQueryFilter = useCallback(
    (filter: iSearch<iCliente>): iFilterQuery<iCliente>[] => {
      let listFilter: iFilterQuery<iCliente>[] = [];

      if (filter.value !== '') {
        if (filter.filterBy === 'CLIENTE' || filter.filterBy === 'CIC')
          listFilter = [
            {
              key: filter.filterBy as keyof iCliente,
              value: filter.value,
              typeSearch: 'eq',
            },
          ];
        else
          listFilter = [
            {
              key: filter.filterBy as keyof iCliente,
              value: filter.value,
            },
          ];
      }
      return listFilter;
    },
    []
  );

  const handleCustomerSearch = useCallback((filter: iSearch<iCliente>) => {
    console.log(filter);

    setLoading(true);
    GetClienteFromVendedor({
      top: 15,
      skip: 0,
      orderBy: 'CLIENTE',
      filter: MountQueryFilter(filter),
    })
      .then((res) => {
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

  const handleCustomer = useCallback((filter: iFilter<iCliente>) => {
    setLoading(true);
    GetClienteFromVendedor(filter)
      .then((res) => {
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
    handleCustomer({ top: 10 });
  }, []);

  if (loading) {
    return <span>Carregando...</span>;
  }

  if (data.value === undefined) {
    console.error('Erro ao carregar clientes:');
    return <span>Carregando...</span>;
  }

  return (
    <section className='flex flex-col gap-x-5 w-full'>
      <Filter options={filterValues} onSearch={handleCustomerSearch} />
      <Suspense fallback={<span>Carregando...</span>}>
        <DataTable
          columns={headers}
          TableData={data.value.value}
          QuantityRegiters={data.value.Qtd_Registros}
          onFetchPagination={handleCustomer}
          IsLoading={loading}
        />
      </Suspense>
    </section>
  );
}

export default DataTableCustomer;

