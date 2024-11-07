'use client';
import { iItensOrcamento, iOrcamento } from '@/@types/Orcamento';
import { iColumnType } from '@/@types/Table';
import { GetOrcamento, removeItem } from '@/app/actions/orcamento';
import { DataTable } from '@/components/CustomDataTable';
import { Input } from '@/components/ui/input';
import {
  faEdit,
  faFileInvoiceDollar,
  faFileLines,
  faPlusCircle,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Suspense, useCallback, useState } from 'react';
import FormEdit from '../EditBudgetIten/FormEdit';
import { ModalEditBudgetItem } from '../EditBudgetIten/ModalEditBudgetItem';
import { PdfViewer } from '../../PdfViewer/PdfViewer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface iItemBudgetTable {
  orc: iOrcamento;
}

const DataTableItensBudget: React.FC<iItemBudgetTable> = ({ orc }) => {
  const [data, setData] = useState<iItensOrcamento[]>(orc.ItensOrcamento);
  const [TOTAL, setTOTAL] = useState<number>(orc.TOTAL);
  const [loading, setLoading] = useState(false);

  const handleItensBudgets = useCallback(() => {
    setLoading(true);
    GetOrcamento(orc.ORCAMENTO)
      .then((res) => {
        if (res.value) {
          setData(res.value.ItensOrcamento);
          setTOTAL(res.value.TOTAL);
        }
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
              removeItem({
                pIdOrcamento: item.ORCAMENTO,
                pProduto: item.PRODUTO.PRODUTO,
              });
              handleItensBudgets();
            }}
          />
          <ModalEditBudgetItem
            modalTitle={`Item Orçamento ${item.ORCAMENTO}`}
            buttonIcon={faEdit}
            iconStyle='cursor-pointer text-emsoft_orange-main hover:text-emsoft_orange-light'
            buttonStyle='bg-tranparent hover:bg-tranparent'
          >
            <FormEdit
              budgetCode={item.ORCAMENTO}
              item={item}
              CallBack={handleItensBudgets}
            />
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

  return (
    <section className='flex flex-col gap-x-5 w-full'>
      <div className='flex gap-4 w-full h-[20%] px-5 py-0 flex-wrap'>
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
      <div className='flex w-full items-center px-5 mt-4 gap-x-4'>
        <ModalEditBudgetItem
          modalTitle={'Novo Item'}
          buttonText={'Novo Item'}
          buttonIcon={faPlusCircle}
        >
          <FormEdit budgetCode={orc.ORCAMENTO} CallBack={handleItensBudgets} />
        </ModalEditBudgetItem>
        <ModalEditBudgetItem
          modalTitle={`Orçamento ${orc.ORCAMENTO}`}
          buttonText={'Gerar PDF'}
          buttonIcon={faFileLines}
        >
          <PdfViewer orc={orc} />
        </ModalEditBudgetItem>
        <Button>
          <Link href={`/app/pre-sales/${orc.ORCAMENTO}`}>
            <FontAwesomeIcon
              icon={faFileInvoiceDollar}
              className={'text-emsoft_light-main mr-2'}
              size='xl'
              title={'Gerar Pré-venda'}
            />
            Gerar Pré-venda
          </Link>
        </Button>
      </div>

      <div className='flex flex-col gap-4 w-full h-[70%] px-5 py-2 mt-5 border-t-2 border-emsoft_orange-main'>
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
      <div className='flex w-full gap-x-5 items-end justify-end px-5 pt-3 mt-4 border-t-2 border-emsoft_orange-main'>
        <span className='bold text-3xl'>TOTAL:</span>
        <span className='bold text-xl'>
          {TOTAL.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL',
          })}
        </span>
      </div>
    </section>
  );
};

export default DataTableItensBudget;

