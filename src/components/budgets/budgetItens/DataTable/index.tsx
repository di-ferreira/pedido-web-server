'use client';
import { iCliente } from '@/@types/Cliente';
import { iItensOrcamento, iOrcamento } from '@/@types/Orcamento';
import { iColumnType } from '@/@types/Table';
import { iVendedor } from '@/@types/Vendedor';
import { GetFinanceiroCliente } from '@/app/actions/cliente';
import { Liberacoes } from '@/app/actions/liberacoes';
import { removeItem } from '@/app/actions/orcamento';
import { DataTable } from '@/components/CustomDataTable';
import { Loading } from '@/components/Loading';
import ToastNotify from '@/components/ToastNotify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormatToCurrency } from '@/lib/utils';
import { useBudget } from '@/store';
import {
  faEdit,
  faFileInvoiceDollar,
  faFilePdf,
  faPlusCircle,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import GeneratePDF from '../../PdfViewer/PdfButton';
import FormEdit from '../EditBudgetIten/FormEdit';
import { ModalEditBudgetItem } from '../EditBudgetIten/ModalEditBudgetItem';

interface iItemBudgetTable {
  orc: iOrcamento;
}

const DataTableItensBudget = ({ orc }: iItemBudgetTable) => {
  const { error, isLoading, updateBudget, current, setCurrent } = useBudget();
  const router = useRouter();

  async function UpdateBudget() {
    try {
      await updateBudget({
        ...current,
      });

      if (error) {
        ToastNotify({
          message: `Erro: ${error}`,
          type: 'error',
        });
        return;
      }

      ToastNotify({
        message: `Sucesso: Orçamento salvo!`,
        type: 'success',
      });
    } catch (err: any) {
      ToastNotify({
        message: `Erro: ${err.message}`,
        type: 'error',
      });
    }
  }

  async function VerifyCustomerLimit() {
    try {
      const resultFinanceiro = await GetFinanceiroCliente(
        (current.CLIENTE as iCliente).CLIENTE,
      );

      if (resultFinanceiro.error !== undefined) {
        throw new Error('Erro ao consultar Saldo de Compras do cliente!');
      }

      const CurrentLimit = resultFinanceiro.value!.SaldoCompra;
      const TotalOrcamento = current.TOTAL;

      if (CurrentLimit < TotalOrcamento) {
        let message = `Cliente ${(orc.CLIENTE as iCliente).NOME} possui limite de crédito de ${FormatToCurrency(CurrentLimit.toString())}.`;

        const liberacao = await Liberacoes({
          ID: 0,
          NOME: 'CLIENTE',
          CODIGO: 'LIMITE',
          CHAVE: (orc.CLIENTE as iCliente).CLIENTE,
          DATA_HORA: '',
          QUEM: `Ven:${(current.VENDEDOR as iVendedor).NOME}`,
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
          throw new Error('Cliente não possui limite para compra!');
        }
      }

      router.push(`/app/pre-sales/${current.ORCAMENTO}`);
    } catch (err: any) {
      ToastNotify({
        message: `Erro: ${err.message}`,
        type: 'error',
      });
    }
  }

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
            title='Remover Item'
            onClick={async () => {
              const response = await removeItem({
                pIdOrcamento: item.ORCAMENTO,
                pProduto: item.PRODUTO.PRODUTO,
              });
              if (response?.value) {
                setCurrent(response.value as iOrcamento);
              }
            }}
          />
          <ModalEditBudgetItem
            key={item.ITEM}
            modalTitle={`Item Orçamento ${item.ORCAMENTO}`}
            buttonIcon={faEdit}
            iconStyle='cursor-pointer text-emsoft_orange-main hover:text-emsoft_orange-light'
            buttonStyle='bg-tranparent hover:bg-tranparent'
            containerStyle='laptop:w-[85vw] laptop:h-[85vh] tablet-a8-portrait:w-[85vw] tablet-a8-portrait:h-[85vh] w-[85vw] h-[85vh]'
          >
            <FormEdit budget={current} item={item} />
          </ModalEditBudgetItem>
        </span>
      ),
    },
    {
      key: 'PRODUTO.PRODUTO',
      title: 'CÓDIGO',
      width: '15%',
      render: (_, item) => (
        <span
          className={`flex w-full items-center justify-center gap-x-5  h-[55px] ${
            item.PRODUTO.QTDATUAL - item.PRODUTO.QTD_GARANTIA <= 0 &&
            ' bg-red-700 text-emsoft_light-surface font-bold'
          }`}
        >
          {item.PRODUTO.PRODUTO}
        </span>
      ),
    },
    {
      key: 'PRODUTO.REFERENCIA',
      title: 'REFERÊNCIA',
      width: '15%',
      render: (_, item) => (
        <span
          className={`flex w-full items-center justify-center gap-x-5  h-[55px] ${
            item.PRODUTO.QTDATUAL - item.PRODUTO.QTD_GARANTIA <= 0 &&
            ' bg-red-700 text-emsoft_light-surface font-bold'
          }`}
        >
          {item.PRODUTO.REFERENCIA}
        </span>
      ),
    },
    {
      key: 'PRODUTO.NOME',
      title: 'PRODUTO',
      width: '15%',
      render: (_, item) => (
        <span
          className={`flex w-full items-center justify-start text-wrap gap-x-5  h-[55px] ${
            item.PRODUTO.QTDATUAL - item.PRODUTO.QTD_GARANTIA <= 0 &&
            ' bg-red-700 text-emsoft_light-surface font-bold'
          }`}
        >
          {item.PRODUTO.NOME}
        </span>
      ),
    },
    {
      key: 'VALOR',
      title: 'VALOR UNITÁRIO',
      width: '10%',
      render: (_, item) => (
        <span
          className={`flex w-full items-center justify-center gap-x-5  h-[55px] ${
            item.PRODUTO.QTDATUAL - item.PRODUTO.QTD_GARANTIA <= 0 &&
            ' bg-red-700 text-emsoft_light-surface font-bold'
          }`}
        >
          {item.VALOR.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL',
          })}
        </span>
      ),
    },
    {
      key: 'PRODUTO.QTDATUAL',
      title: 'QTD EST.',
      width: '5%',
      render: (_, item) => (
        <span
          className={`flex w-full items-center justify-center gap-x-5  h-[55px] ${
            item.PRODUTO.QTDATUAL - item.PRODUTO.QTD_GARANTIA <= 0 &&
            ' bg-red-700 text-emsoft_light-surface font-bold'
          }`}
        >
          {item.PRODUTO.QTDATUAL - item.PRODUTO.QTD_GARANTIA}
        </span>
      ),
    },
    {
      key: 'QTD',
      title: 'QTD',
      width: '5%',
      render: (_, item) => (
        <span
          className={`flex w-full items-center justify-center gap-x-5  h-[55px] ${
            item.PRODUTO.QTDATUAL - item.PRODUTO.QTD_GARANTIA <= 0 &&
            ' bg-red-700 text-emsoft_light-surface font-bold'
          }`}
        >
          {item.QTD}
        </span>
      ),
    },
    {
      key: 'TOTAL',
      title: 'TOTAL',
      width: '15%',
      render: (_, item) => (
        <span
          className={`flex w-full items-center justify-center gap-x-5  h-[55px] ${
            item.PRODUTO.QTDATUAL - item.PRODUTO.QTD_GARANTIA <= 0 &&
            ' bg-red-700 text-emsoft_light-surface font-bold'
          }`}
        >
          {item.TOTAL.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL',
          })}
        </span>
      ),
    },
  ];

  return (
    <section className='flex flex-col gap-x-5 w-full mt-7 tablet-portrait:gap-y-6'>
      <div className='flex gap-4 w-full h-[20%] px-5 py-0 flex-wrap tablet-portrait:h-auto tablet-portrait:gap-y-6 tablet:h-[30%]'>
        <Input
          labelText='TABELA'
          labelPosition='top'
          name='TABELA'
          value={(current.CLIENTE as iCliente)?.Tabela || ''}
          disabled={true}
          className='w-[10%] h-7'
        />
        <Input
          labelText='OBSERVAÇÃO 1'
          labelPosition='top'
          name='OBS1'
          value={current.OBS1 || ''}
          onChange={(e) => {
            setCurrent({ ...current, OBS1: e.target.value });
          }}
          className='w-[40.5%] h-7'
        />

        <Input
          labelText='OBSERVAÇÃO 2'
          labelPosition='top'
          name='OBS2'
          value={current.OBS2 || ''}
          onChange={(e) => {
            setCurrent({ ...current, OBS2: e.target.value });
          }}
          className='w-[41%] h-7'
        />
      </div>
      <div className='flex w-full items-center px-5 mt-8 gap-x-4 tablet-portrait:h-auto tablet-portrait:gap-y-6'>
        <ModalEditBudgetItem
          modalTitle={'Novo Item'}
          buttonText={'Novo Item'}
          buttonIcon={faPlusCircle}
          containerStyle='laptop:w-[85vw] laptop:h-[85vh] tablet-a8-portrait:w-[85vw] tablet-a8-portrait:h-[85vh] w-[85vw] h-[85vh]'
        >
          <FormEdit budget={current} />
        </ModalEditBudgetItem>
        <ModalEditBudgetItem
          modalTitle={`Orçamento ${current.ORCAMENTO}`}
          buttonText={'Gerar PDF'}
          buttonIcon={faFilePdf}
        >
          <div className='w-full h-full'>
            <GeneratePDF orc={current} />
          </div>
        </ModalEditBudgetItem>
        <Button onClick={VerifyCustomerLimit}>
          <FontAwesomeIcon
            icon={faFileInvoiceDollar}
            className={'text-emsoft_light-main mr-2'}
            size='xl'
            title={'Gerar Pré-venda'}
          />
          Gerar Pré-venda
        </Button>
        <Button
          className='bg-emsoft_success-main text-emsoft_dark-text'
          onClick={UpdateBudget}
        >
          <FontAwesomeIcon
            icon={faFileInvoiceDollar}
            className={'text-emsoft_dark-text mr-2'}
            size='xl'
            title={'Gerar Pré-venda'}
          />
          Salvar Orçamento
        </Button>
      </div>

      <div className='flex flex-col gap-4 w-full h-[70%] px-5 py-2 mt-5 border-t-2 border-emsoft_orange-main overflow-x-hidden overflow-y-scroll'>
        {isLoading ? (
          <Loading />
        ) : (
          <Suspense fallback={<span>Carregando...</span>}>
            <DataTable
              columns={tableHeaders}
              TableData={current.ItensOrcamento || []}
              IsLoading={false}
            />
          </Suspense>
        )}
      </div>
      <div className='flex w-full gap-x-5 items-end justify-end px-5 pt-3 mt-4 border-t-2 border-emsoft_orange-main'>
        <span className='bold text-3xl'>TOTAL:</span>
        <span className='bold text-xl'>
          {(current.TOTAL || 0).toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL',
          })}
        </span>
      </div>
    </section>
  );
};

export default DataTableItensBudget;

