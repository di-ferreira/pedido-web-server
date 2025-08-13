'use client';
import { iSearch, ResponseType } from '@/@types';
import { iFilter, iFilterQuery } from '@/@types/Filter';
import { iOrcamento } from '@/@types/Orcamento';
import { iColumnType, iDataResultTable } from '@/@types/Table';
import { GetOrcamentosFromVendedor } from '@/app/actions/orcamento';
import { DataTable } from '@/components/CustomDataTable';
import ErrorMessage from '@/components/ErrorMessage';
import Filter from '@/components/Filter';
import { Loading } from '@/components/Loading';
import { KEY_NAME_TABLE_PAGINATION } from '@/constants';
import { removeStorage } from '@/lib/utils';
import {
  faEdit,
  faFileLines,
  faFilePdf,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { ModalEditBudgetItem } from '../budgetItens/EditBudgetIten/ModalEditBudgetItem';
import GeneratePDF from '../PdfViewer/PdfButton';
import RemoveBudget from '../RemoveBudget/FormRemoveBudget';

function DataTableBudget() {
  const [data, setData] = useState<ResponseType<iDataResultTable<iOrcamento>>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const filterValues = [
    { key: 'ORÇAMENTOS ABERTOS', value: 'N' },
    { key: 'ORÇAMENTOS FECHADOS', value: 'S' },
  ];
  const MountQueryFilter = useCallback(
    (filter: iSearch<iOrcamento>): iFilterQuery<iOrcamento>[] => {
      let listFilter: iFilterQuery<iOrcamento>[] = [];

      listFilter.push({ key: 'PV', value: filter.filterBy, typeSearch: 'ne' });

      return listFilter;
    },
    []
  );
  const handleBudgetSearch = useCallback((filter: iSearch<iOrcamento>) => {
    const valueSearch: string = filter.filterBy;

    //PV eq NÃO?
    if (valueSearch == 'N')
      handleBudgets({
        top: 10,
        skip: 0,
        orderBy: 'ORCAMENTO desc' as keyof iOrcamento,
        filter: [{ key: 'PV', value: 'S', typeSearch: 'ne' }],
      });
    else
      handleBudgets({
        top: 50,
        skip: 0,
        orderBy: 'ORCAMENTO desc' as keyof iOrcamento,
        filter: [{ key: 'PV', value: 'S', typeSearch: 'eq' }],
      });
  }, []);

  const refreshTable = useCallback(() => {
    const currentParams = localStorage.getItem(KEY_NAME_TABLE_PAGINATION);
    const params = currentParams
      ? JSON.parse(currentParams)
      : { top: 10, skip: 0 };

    handleBudgets({
      ...params,
      filter: params.filter || [], // Mantém filtros atuais
    });
  }, []);

  const handleBudgets = useCallback((filter: iFilter<iOrcamento>) => {
    setLoading(true);
    GetOrcamentosFromVendedor(filter)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const headers: iColumnType<iOrcamento>[] = [
    {
      key: 'ORCAMENTO',
      title: 'ORCAMENTO',
      width: '150px',
    },
    {
      key: 'CLIENTE.NOME',
      title: 'NOME',
      width: '20rem',
    },
    {
      key: 'DATA',
      title: 'DATA',
      width: '20rem',
      render: (_, item) => {
        return dayjs(item.DATA).format('DD/MM/YYYY');
      },
    },
    {
      key: 'VENDEDOR.NOME',
      title: 'VENDEDOR',
      width: '20rem',
    },
    {
      key: 'TOTAL',
      title: 'TOTAL',
      width: '7rem',
      render: (_, item) => {
        return item.TOTAL.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        });
      },
    },
    {
      key: 'acoes',
      title: 'AÇÕES',
      width: '5rem',
      render: (_, item) => (
        <span className='flex w-full items-center justify-center gap-x-5'>
          <Link href={`/app/pre-sales/${item.ORCAMENTO}`}>
            <FontAwesomeIcon
              icon={faFileLines}
              className='text-emsoft_success-main hover:text-emsoft_success-light'
              size='xl'
              title='Gerar Pré-venda'
            />
          </Link>

          <Link href={`/app/budgets/${item.ORCAMENTO}`}>
            <FontAwesomeIcon
              icon={faEdit}
              className='text-emsoft_orange-main hover:text-emsoft_orange-light'
              size='xl'
              title='Editar'
            />
          </Link>
          <ModalEditBudgetItem
            modalTitle={`Orçamento ${item.ORCAMENTO}`}
            buttonIcon={faFilePdf}
            buttonStyle='bg-transparent hover:bg-transparent m-0 p-0'
            iconStyle='text-emsoft_blue-light hover:text-emsoft_blue-main'
            titleButton='Gerar PDF'
          >
            <div className='w-full h-full'>
              <GeneratePDF orc={item} />
            </div>
          </ModalEditBudgetItem>
          <ModalEditBudgetItem
            modalTitle=''
            buttonIcon={faTrashAlt}
            buttonStyle='bg-transparent hover:bg-transparent m-0 p-0'
            iconStyle='text-emsoft_danger-light hover:text-emsoft_danger-main'
            titleButton='Excluir Orçamento'
            containerStyle='h-[150px]  w-[200px] laptop:w-[45vh] laptop:h-[20vh] tablet-a8-portrait:w-[45vh] tablet-a8-portrait:h-[20vh]'
            titleStyle='text-xl'
          >
            <RemoveBudget params={item} onSuccess={refreshTable} />
          </ModalEditBudgetItem>
        </span>
      ),
    },
  ];
  useEffect(() => {
    removeStorage(KEY_NAME_TABLE_PAGINATION);
    handleBudgets({
      top: 10,
      filter: [{ key: 'PV', value: 'S', typeSearch: 'ne' }],
    });
  }, []);

  if (data.error !== undefined) {
    return (
      <ErrorMessage
        title={`Erro ao carregar orçamentos`}
        message={`${data.value?.Qtd_Registros}`}
      />
    );
  }

  return (
    <section className='flex flex-col gap-5 w-full pt-4'>
      <Filter
        input={false}
        options={filterValues}
        onSearch={handleBudgetSearch}
      />
      <Suspense fallback={<Loading />}>
        <DataTable
          columns={headers}
          TableData={data.value?.value!}
          QuantityRegiters={data.value?.Qtd_Registros}
          onFetchPagination={handleBudgets}
          IsLoading={loading}
        />
      </Suspense>
    </section>
  );
}

export default DataTableBudget;

