'use client';
import { iItensOrcamento, iOrcamento } from '@/@types/Orcamento';
import { iColumnType } from '@/@types/Table';
import { GetOrcamento, removeItem } from '@/app/actions/orcamento';
import { DataTable } from '@/components/CustomDataTable';
import {
  faEdit,
  faPlusCircle,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Suspense, useCallback, useState } from 'react';
import FormEdit from '../EditBudgetIten/FormEdit';
import { ModalEditBudgetItem } from '../EditBudgetIten/ModalEditBudgetItem';
import { Input } from '@/components/ui/input';

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
          <ModalEditBudgetItem
            modalTitle={`Item Orçamento ${item.ORCAMENTO}`}
            buttonIcon={faEdit}
            iconStyle='cursor-pointer text-emsoft_orange-main hover:text-emsoft_orange-light'
            buttonStyle='bg-tranparent hover:bg-tranparent'
          >
            <FormEdit budgetCode={item.ORCAMENTO} item={item} />
          </ModalEditBudgetItem>
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

  // if (loading) {
  //   return <span>Carregando...</span>;
  // }

  return (
    <section className='flex flex-col gap-x-5 w-full'>
      <div className='flex gap-4 w-full h-[40%] px-5 py-0 flex-wrap'>
        <Input
          labelText='OBSERVAÇÃO 1'
          labelPosition='top'
          name='OBS1'
          value={orc.OBS1}
          className='w-[45.5%]'
        />

        <Input
          labelText='OBSERVAÇÃO 2'
          labelPosition='top'
          name='OBS2'
          value={orc.OBS2}
          className='w-[46%]'
        />
      </div>
      <div className='flex w-full items-center px-5 mt-4'>
        <ModalEditBudgetItem
          modalTitle={'Novo Item'}
          buttonText={'Novo Item'}
          buttonIcon={faPlusCircle}
        >
          <FormEdit budgetCode={orc.ORCAMENTO} CallBack={handleItensBudgets} />
        </ModalEditBudgetItem>
      </div>

      <div className='flex gap-4 w-full h-[70%] px-5 py-2 mt-5 border-t-2 border-emsoft_orange-main'>
        {loading ? (
          <span>Carregando...</span>
        ) : (
          <Suspense fallback={<span>Carregando...</span>}>
            <DataTable
              columns={tableHeaders}
              TableData={data}
              IsLoading={false}
            />
          </Suspense>
        )}
      </div>
    </section>
  );
};

export default DataTableItensBudget;

