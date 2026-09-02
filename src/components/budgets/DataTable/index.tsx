'use client';
import { iSearch, ResponseType } from '@/@types';
import { iCliente } from '@/@types/Cliente';
import { iFilter } from '@/@types/Filter';
import { iOrcamento } from '@/@types/Orcamento';
import { SearchOperator } from '@/@types/QueryFilter';
import { iColumnType, iDataResultTable } from '@/@types/Table';
import { iVendedor } from '@/@types/Vendedor';
import { GetFinanceiroCliente } from '@/app/actions/cliente';
import { Liberacoes } from '@/app/actions/liberacoes';
import { GetOrcamentosFromVendedor } from '@/app/actions/orcamento';
import { DataTable } from '@/components/CustomDataTable';
import ErrorMessage from '@/components/ErrorMessage';
import Filter from '@/components/Filter';
import { Loading } from '@/components/Loading';
import ToastNotify from '@/components/ToastNotify';
import { Button } from '@/components/ui/button';
import { KEY_NAME_TABLE_PAGINATION } from '@/constants';
import { FormatToCurrency, removeStorage } from '@/lib/utils';
import { useBudget } from '@/store';
import {
  faEdit,
  faFileLines,
  faFilePdf,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { ModalEditBudgetItem } from '../budgetItens/EditBudgetIten/ModalEditBudgetItem';
import GeneratePDF from '../PdfViewer/PdfButton';
import RemoveBudget from '../RemoveBudget/FormRemoveBudget';

function DataTableBudget() {
  const budget = useBudget();
  const router = useRouter();
  const [data, setData] = useState<ResponseType<iDataResultTable<iOrcamento>>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const filterValues = [
    { key: 'ORÇAMENTOS ABERTOS', value: 'N' },
    { key: 'ORÇAMENTOS FECHADOS', value: 'S' },
  ];

  const handleBudgetSearch = useCallback((filter: iSearch<iOrcamento>) => {
    const valueSearch: string = filter.filterBy;
    const day = dayjs().subtract(2, 'months').format('YYYY-MM-DD');

    //PV eq NÃO?
    if (valueSearch == 'N') handleBudgets();
    else
      handleBudgets({
        top: 50,
        skip: 0,
        orderBy: 'ORCAMENTO desc' as keyof iOrcamento,
        filter: [
          { key: 'PV', value: 'S', typeSearch: 'eq' },
          { key: 'DATA', value: day, typeSearch: 'ge' },
        ],
      });
  }, []);

  const refreshTable = useCallback(() => {
    const day = dayjs().subtract(36, 'hour').format('YYYY-MM-DD');
    const currentParams = localStorage.getItem(KEY_NAME_TABLE_PAGINATION);
    const params = currentParams
      ? JSON.parse(currentParams)
      : { top: 10, skip: 0 };

    handleBudgets({
      ...params,
      top: 50,
      skip: 0,
      orderBy: 'ORCAMENTO desc' as keyof iOrcamento,
      filter: [
        { key: 'PV', value: 'S', typeSearch: 'eq' },
        { key: 'DATA', value: day, typeSearch: 'ge' },
      ],
    });
  }, []);

  const handleBudgets = useCallback((filter?: iFilter<iOrcamento>) => {
    setLoading(true);
    if (filter) {
      GetOrcamentosFromVendedor({
        orderBy: 'ORCAMENTO',
        top: filter.top,
        skip: filter.skip,
        filter: {
          operator: 'and',
          conditions:
            filter.filter!.map((f) => {
              return {
                key: f.key,
                value: f.value,
                operator: (f.typeSearch as SearchOperator) || 'eq',
              };
            }) || [],
        },
      })
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error('handleBudgets', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else
      GetOrcamentosFromVendedor()
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error('handleBudgets', err);
        })
        .finally(() => {
          setLoading(false);
        });
  }, []);

  const EditBudget = (item: iOrcamento) => {
    budget.setCurrent(item);
    router.push(`/app/budgets/${item.ORCAMENTO}`);
  };

  async function generatePreSale(item: iOrcamento) {
    try {
      if (!item.ItensOrcamento || item.ItensOrcamento.length === 0) {
        ToastNotify({
          message: 'Não há itens no orçamento!',
          type: 'warning',
        });
        return;
      }

      const resultFinanceiro = await GetFinanceiroCliente(
        (item.CLIENTE as iCliente).CLIENTE,
      );

      if (resultFinanceiro.error !== undefined) {
        ToastNotify({
          message: 'Erro ao consultar Saldo de Compras do cliente!',
          type: 'error',
        });
        return;
      }

      const CurrentLimit = resultFinanceiro.value!.SaldoCompra;
      const UsaLimite = resultFinanceiro.value!.UsaLimite;

      if (UsaLimite && CurrentLimit < item.TOTAL) {
        const message = `Cliente ${(item.CLIENTE as iCliente).NOME} possui limite de crédito de ${FormatToCurrency(CurrentLimit.toString())}.`;

        const liberacao = await Liberacoes({
          ID: 0,
          NOME: 'CLIENTE',
          CODIGO: 'LIMITE',
          CHAVE: (item.CLIENTE as iCliente).CLIENTE,
          DATA_HORA: '',
          QUEM: `Ven:${(item.VENDEDOR as iVendedor).NOME}`,
          USADO: 'N',
          ONDE: 'PRÉ-VENDA',
          ID_ONDE: 9999,
          OBS: message,
          MOVIMENTO: 0,
        });

        if (
          !liberacao.value ||
          liberacao.value.USADO !== 'S' ||
          liberacao.value.ID_ONDE === 9999
        ) {
          ToastNotify({
            message: 'Cliente não possui limite para compra!',
            type: 'error',
          });
          return;
        }
      }

      budget.setCurrent(item);
      router.push(`/app/pre-sales/${item.ORCAMENTO}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao gerar pré-venda';
      ToastNotify({ message: `Erro: ${msg}`, type: 'error' });
    }
  }

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
      render: (_, item) => {
        return (
          <span className='flex w-full items-center justify-center gap-x-5'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => generatePreSale(item)}
            >
              <FontAwesomeIcon
                icon={faFileLines}
                className='text-emsoft_success-main hover:text-emsoft_success-light'
                size='xl'
                title='Gerar Pré-venda'
              />
            </Button>

            <FontAwesomeIcon
              icon={faEdit}
              className='text-emsoft_orange-main hover:text-emsoft_orange-light cursor-pointer'
              size='xl'
              title='Editar'
              onClick={() => EditBudget(item)}
            />
            <ModalEditBudgetItem
              modalTitle={`Orçamento ${item.ORCAMENTO}`}
              buttonIcon={faFilePdf}
              buttonStyle='bg-transparent hover:bg-transparent m-0 p-0'
              iconStyle='text-emsoft_blue-light hover:text-emsoft_blue-main'
              titleButton='Gerar PDF'
              containerStyle='laptop:w-[85vw] laptop:h-[85vh] tablet-a8-portrait:w-[85vw] tablet-a8-portrait:h-[85vh] w-[85vw] h-[85vh]'
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
        );
      },
    },
  ];
  useEffect(() => {
    removeStorage(KEY_NAME_TABLE_PAGINATION);
    handleBudgets();
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

