'use client';
import { iFilter } from '@/@types/Filter';
import { iItensOrcamento, iOrcamento } from '@/@types/Orcamento';
import { GetOrcamento, removeItem } from '@/app/actions/orcamento';
import { DataTable } from '@/components/CustomDataTable';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { iColumnType } from '@/@types/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

interface iItemBudgetTable {
  orc: iOrcamento;
}

const DataTableItensBudget: React.FC<iItemBudgetTable> = ({ orc }) => {
  const [data, setData] = useState<iItensOrcamento[]>(orc.ItensOrcamento);
  const [loading, setLoading] = useState(false);

  const handleItensBudgets = useCallback(() => {
    setLoading(true);
    GetOrcamento(orc.ORCAMENTO)
      .then((res) => {
        console.log('orçamentos:', res);
        if (res.value) setData(res.value.ItensOrcamento);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar clientes:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const tableHeaders: iColumnType<iItensOrcamento>[] = [
    {
      key: 'acoes',
      title: 'AÇÕES',
      width: '15%',
      render: (_, item) => (
        <span className='flex w-full items-center justify-center gap-x-5'>
          <FontAwesomeIcon
            icon={faTrashAlt}
            className='cursor-pointer text-emsoft_blue-main hover:text-emsoft_blue-light'
            size='xl'
            title='Gerar Pré-venda'
            onClick={() => {
              removeItem(item);
              handleItensBudgets();
            }}
          />
          <FontAwesomeIcon
            icon={faEdit}
            className='cursor-pointer text-emsoft_orange-main hover:text-emsoft_orange-light'
            size='xl'
            title='Editar'
          />
        </span>
      ),
    },
    {
      key: 'PRODUTO.PRODUTO',
      title: 'CÓDIGO',
      width: '15%',
    },
    {
      key: 'PRODUTO.REFERENCIA',
      title: 'REFERÊNCIA',
      width: '15%',
    },
    {
      key: 'PRODUTO.NOME',
      title: 'PRODUTO',
      width: '15%',
    },
    {
      key: 'PRODUTO.APLICACOES',
      title: 'APLICAÇÕES',
      width: '35%',
    },
    {
      key: 'PRODUTO.FABRICANTE.NOME',
      title: 'FABRICANTE',
      width: '15%',
    },
    {
      key: 'QTD',
      title: 'QTD',
      width: '5%',
    },
    {
      key: 'TOTAL',
      title: 'TOTAL',
      width: '15%',
      isHideMobile: true,
      render: (_, item) => {
        return item.TOTAL.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        });
      },
    },
  ];

  if (loading) {
    return <span>Carregando...</span>;
  }

  return (
    <section className='flex flex-col gap-x-5 w-full'>
      <Suspense fallback={<span>Carregando...</span>}>
        <DataTable columns={tableHeaders} TableData={data} IsLoading={false} />
      </Suspense>
    </section>
  );
};

export default DataTableItensBudget;

