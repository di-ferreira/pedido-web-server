'use client';
import { ResponseType } from '@/@types';
import { iCliente } from '@/@types/Cliente';
import { iFilter } from '@/@types/Filter';
import { iDataResultTable } from '@/@types/Table';
import { GetClienteFromVendedor } from '@/app/actions/cliente';
import { DataTable } from '@/components/CustomDataTable';
import { useCallback, useEffect, useState } from 'react';
import { headers } from './columns';
import Filter from '@/components/Filter';

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
    <>
      <Filter options={filterValues} onSearch={handleCustomer} />
      <DataTable
        columns={headers}
        TableData={data.value.value}
        QuantityRegiters={data.value.Qtd_Registros}
        onFetchPagination={handleCustomer}
        IsLoading={loading}
      />
    </>
  );
}

export default DataTableCustomer;

