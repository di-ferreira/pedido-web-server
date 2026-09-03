'use client';
import { iCliente, iFinanceiroCliente } from '@/@types/Cliente';
import { iOrcamento } from '@/@types/Orcamento';
import {
  iCondicaoPgto,
  iFormaPgto,
  iItemPreVenda,
  iParcelasPgto,
  iPreVenda,
} from '@/@types/PreVenda';
import { iVendedor } from '@/@types/Vendedor';
import { GetFinanceiroCliente } from '@/app/actions/cliente';
import { Liberacoes } from '@/app/actions/liberacoes';
import { UpdateOrcamento } from '@/app/actions/orcamento';
import {
  GetCondicaoPGTO,
  GetFormasPGTO,
  SavePreVenda,
} from '@/app/actions/preVenda';
import { getVendedorAction } from '@/app/actions/user';
import ToastNotify from '@/components/ToastNotify';
import { getBloqueios } from '@/lib/bloqueios';
import { FormatToCurrency, cn, getErrorMessage } from '@/lib/utils';
import {
  faFileInvoiceDollar,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { DataTable } from '../CustomDataTable';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { tableHeaders } from './columnsParcelas';
import FreteSection from './FreteSection';
import PaymentConditionsSection from './PaymentConditionsSection';

interface iFormEditPreSale {
  orc: iOrcamento;
}
type iFrete = 'ENTREGA' | 'RETIRADA';
interface iTipoEntrega {
  id: iFrete;
  value: iFrete;
}

const FormEditPreSale = ({ orc }: iFormEditPreSale) => {
  const router = useRouter();
  const [CondicaoPgto, setCondicaoPgto] = useState<iCondicaoPgto[]>([]);
  const [CondicaoPgtoSelected, setCondicaoPgtoSelected] =
    useState<iCondicaoPgto>({
      ID: 0,
      NOME: '',
      PARCELAS: 0,
      VALOR_PARCELA: 0,
      VALOR_MINIMO: 0,
      PM: 0,
      PZ01: 0,
      PZ02: 0,
      PZ03: 0,
      PZ04: 0,
      PZ05: 0,
      PZ06: 0,
      PZ07: 0,
      PZ08: 0,
      PZ09: 0,
      PZ10: 0,
      TIPO: '',
      DESTACAR_DESCONTO: '',
      FORMA: '',
    });
  const [FormaPgto, setFormaPgto] = useState<iFormaPgto[]>([]);
  const [FormaPgtoSelected, setFormaPgtoSelected] = useState<iFormaPgto>();
  const [ParcelasPgto, setParcelasPgto] = useState<iParcelasPgto[]>([]);
  const [TipoEntrega, _] = useState<iTipoEntrega[]>([
    {
      id: 'ENTREGA',
      value: 'ENTREGA',
    },
    {
      id: 'RETIRADA',
      value: 'RETIRADA',
    },
  ]);
  const [TipoEntregaSelected, setTipoEntregaSelected] = useState<iTipoEntrega>(
    TipoEntrega[0],
  );

  const [IsDelivery, setIsDelivery] = useState<boolean>(
    TipoEntrega[0].value === 'ENTREGA',
  );

  const [preSale, setPreSale] = useState<iPreVenda>({
    CodigoCliente: (orc.CLIENTE as iCliente).CLIENTE,
    CodigoCondicaoPagamento: 0,
    CodigoVendedor1: (orc.VENDEDOR as iVendedor).VENDEDOR,
    DataPedido: dayjs().format('YYYY-MM-DD').toString(),
    ModeloNota: '55',
    Itens: [],
    SubTotal: orc.TOTAL,
    Total: orc.TOTAL,
    ObsPedido1: orc.OBS1 ? orc.OBS1 : '',
    ObsPedido2: orc.OBS2 ? orc.OBS2 : '',
    ObsNotaFiscal: '',
    Entrega: TipoEntrega[0].value === 'ENTREGA' ? 'S' : 'N',
    NumeroOrdemCompraCliente: '',
    CodigoVendedor2:
      (orc.VENDEDOR as iVendedor).TIPO_VENDEDOR === 'I'
        ? (orc.CLIENTE as iCliente).VENDEDOR
        : 0,
    Desconto: 0,
    Origem: '',
    PedidoEcommerce: '',
    TipoEntrega: TipoEntrega[0].value === 'ENTREGA' ? 'CARRO' : 'VEM BUSCAR',
    ValorFrete: 0,
  });

  function getCondicao() {
    if (orc.TOTAL > 0) {
      GetCondicaoPGTO(
        orc ? orc.TOTAL : 0,
        (orc.CLIENTE as iCliente).Tabela !== null
          ? (orc.CLIENTE as iCliente).Tabela
          : 'SISTEMA',
        (orc.CLIENTE as iCliente).CARTEIRA === 'N',
      ).then((condicao) => {
        if (condicao.value === null) {
          ToastNotify({
            message: 'não a condições para o total do orçamento!',
            type: 'error',
          });
        }
        if (condicao.value) {
          setCondicaoPgto(condicao.value);
          setCondicaoPgtoSelected(condicao.value[0]);
          parcelasList(condicao.value[0]);
        }
      });
    }
  }

  function getFormasPgto() {
    GetFormasPGTO().then((formas) => {
      if (formas.value) {
        setFormaPgto(formas.value);
        let formaFilter = formas.value.find(
          (forma) => forma.CARTAO === 'BOLETO',
        );
        let forma: iFormaPgto = formaFilter ? formaFilter : formas.value[0];
        setFormaPgtoSelected(forma);
      }
    });
  }

  function parcelasList(condicao: iCondicaoPgto) {
    const parcelas: iParcelasPgto[] = [];
    const DataVencimento = dayjs();
    type KeyCondicao = keyof typeof condicao;

    for (let i = 0; i < condicao.PARCELAS; i++) {
      const ParcelaNameKey: KeyCondicao = ('PZ0' +
        String(i + 1)) as KeyCondicao;
      const DiaParcela: number = Number(condicao[ParcelaNameKey]);

      parcelas.push({
        DIAS: DiaParcela,
        VALOR: preSale.Total / condicao.PARCELAS,
        VENCIMENTO: DataVencimento.add(DiaParcela, 'day').format('DD/MM/YYYY'),
      });
    }

    setParcelasPgto((old) => (old = parcelas));
  }

  function hasProdutoZerado(orc: iOrcamento): boolean {
    return orc.ItensOrcamento.some((item) => {
      const estoqueDisponivel =
        item.PRODUTO.QTDATUAL - item.PRODUTO.QTD_GARANTIA;
      return estoqueDisponivel <= 0;
    });
  }

  async function hasBloqueioCliente(orc: iOrcamento): Promise<boolean> {
    try {
      const resultFinanceiro = await GetFinanceiroCliente(
        (orc.CLIENTE as iCliente).CLIENTE,
      );
      if (resultFinanceiro.error !== undefined) {
        throw new Error(resultFinanceiro.error.message);
      }

      const financeiro: iFinanceiroCliente = resultFinanceiro.value!;

      let nomeVendedor: string = (await getVendedorAction()).value!.NOME;

      const bloqueios = getBloqueios({
        contasAtrazadas: financeiro.ContasAtrazadas,
        usaLimite: financeiro.UsaLimite,
        saldoCompra: financeiro.SaldoCompra,
        totalPedido: orc.TOTAL,
        bloqueado: (orc.CLIENTE as iCliente).BLOQUEADO,
      });

      for (const codigo of bloqueios) {
        let message = '';

        if (codigo === 'LIMITE') {
          message = `Cliente ${(orc.CLIENTE as iCliente).NOME} possui saldo disponível de ${FormatToCurrency(financeiro.SaldoCompra.toString())} para um pedido de ${FormatToCurrency(orc.TOTAL.toString())}.`;
        }
        if (codigo === 'INADIMPLENCIA') {
          message = `Cliente ${(orc.CLIENTE as iCliente).NOME} possui inadimplência de ${FormatToCurrency(financeiro.ContasAtrazadas.toString())} não liberada.`;
        }
        if (codigo === 'BLOQUEADO') {
          message = `Cliente ${(orc.CLIENTE as iCliente).NOME} está bloqueado.`;
        }
        const liberacao = await Liberacoes({
          ID: 0,
          NOME: 'CLIENTE',
          CODIGO: codigo,
          CHAVE: (orc.CLIENTE as iCliente).CLIENTE,
          DATA_HORA: '',
          QUEM: `Ven:${nomeVendedor}`,
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
            message: `Cliente ${(orc.CLIENTE as iCliente).NOME} possui bloqueio de ${codigo} não liberado.`,
            type: 'error',
          });
          return true;
        }
      }

      return false;
    } catch (e) {
      ToastNotify({
        message: `Erro ao verificar bloqueios do cliente: ${getErrorMessage(e)}`,
        type: 'error',
      });
      return true;
    }
  }

  const GerarPV = async () => {
    try {
      if (hasProdutoZerado(orc)) {
        ToastNotify({
          message: `Existe produto com estoque zerado na lista!`,
          type: 'error',
        });
        return;
      }

      const bloqueio = await hasBloqueioCliente(orc);
      if (bloqueio) {
        ToastNotify({
          message: `Cliente ${(orc.CLIENTE as iCliente).NOME} possui bloqueio não liberado.`,
          type: 'error',
        });
        return;
      }

      const ItensPV: iItemPreVenda[] = [];
      for (const item of orc.ItensOrcamento) {
        if (item.QTD <= 0)
          throw new Error(`O Item ${item.PRODUTO.PRODUTO} está zerado!`);
        ItensPV.push({
          CodigoProduto: item.PRODUTO.PRODUTO,
          Qtd: item.QTD,
          Desconto: item.DESCONTO || 0,
          SubTotal: item.SUBTOTAL,
          Tabela: item.TABELA,
          Valor: item.VALOR,
          Total: item.TOTAL,
          Frete: 0,
        });
      }
      const PV: iPreVenda = {
        ...preSale,
        Itens: ItensPV,
        CodigoCondicaoPagamento: CondicaoPgtoSelected.ID,
        Entrega: IsDelivery ? 'S' : 'N',
        TipoEntrega: IsDelivery ? 'CARRO' : 'VEM BUSCAR',
      };

      const res = await SavePreVenda(PV);

      if (res.error) throw res.error;

      const resOrc = await UpdateOrcamento({
        ...orc,
        PV: 'S',
      });

      if (resOrc.error) throw resOrc.error;

      if (res.value) {
        ToastNotify({
          message: 'Pré-venda gerada com sucesso',
          type: 'success',
        });
        router.push('/app/pre-sales');
      }
    } catch (e) {
      ToastNotify({
        message: `Erro ao gerar pré-venda: ${getErrorMessage(e)}`,
        type: 'error',
      });
    }
  };

  useEffect(() => {
    getCondicao();
    getFormasPgto();
  }, []);

  return (
    <section className='flex flex-col w-full gap-4 pb-4 max-h-screen overflow-y-auto'>
      <h1
        className={`text-4xl font-bold mt-5 py-1 px-3 
          border-b-2 text-emsoft_dark-text
        border-emsoft_orange-main`}
      >
        Nova Pré-Venda
      </h1>
      <div className='flex flex-col w-full'>
        <div className='w-[85%] flex gap-x-3 tablet:w-full tablet:px-3'>
          <div className='flex flex-col w-[70%] px-4 tablet:w-[50%]'>
            <h4>CONDIÇÃO DE PAGAMENTO</h4>
            <PaymentConditionsSection
              CondicaoPgto={CondicaoPgto}
              CondicaoPgtoSelected={CondicaoPgtoSelected}
              FormaPgto={FormaPgto}
              FormaPgtoSelected={FormaPgtoSelected}
              ObsPedido={preSale.ObsPedido1}
              onCondicaoChange={(condicao) => {
                parcelasList(condicao);
                setCondicaoPgtoSelected(condicao);
              }}
              onFormaChange={(forma) => setFormaPgtoSelected(forma)}
              onObsPedidoChange={(value) =>
                setPreSale((old) => ({ ...preSale, ObsPedido1: value }))
              }
            />
            <FreteSection
              TipoEntrega={TipoEntrega}
              TipoEntregaSelected={TipoEntregaSelected}
              ObsNotaFiscal={preSale.ObsNotaFiscal}
              onTipoEntregaChange={(entrega) => {
                setTipoEntregaSelected(entrega);
                const isEntrega = entrega.value === 'ENTREGA';
                setIsDelivery(isEntrega);
                setPreSale((prev) => ({
                  ...prev,
                  Entrega: isEntrega ? 'S' : 'N',
                  TipoEntrega: isEntrega ? 'CARRO' : 'VEM BUSCAR',
                }));
              }}
              onObsNotaFiscalChange={(value) =>
                setPreSale((old) => ({ ...preSale, ObsNotaFiscal: value }))
              }
            />
          </div>
          <div className='flex flex-col w-[30%] tablet:w-[45%]'>
            <Suspense fallback={<span>Carregando parcelas...</span>}>
              <DataTable
                columns={tableHeaders}
                TableData={ParcelasPgto}
                IsLoading={false}
              />
            </Suspense>
          </div>
        </div>
        <div className='w-[85%] flex mt-5 px-4 flex-wrap gap-3 items-end tablet:w-full'>
          <div className='w-[32.5%] tablet:w-[50%]'>
            <Input
              readOnly={true}
              labelText='SUBTOTAL'
              labelPosition='top'
              name='SUBTOTAL'
              value={preSale.SubTotal.toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL',
              })}
              height='3.5rem'
            />
          </div>
          <div className='w-[32.99%] tablet:w-[47%]'>
            <Input
              readOnly={true}
              labelText='TOTAL'
              labelPosition='top'
              name='TOTAL'
              value={preSale.Total.toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL',
              })}
              height='3.5rem'
            />
          </div>
        </div>
      </div>
      <footer className='flex w-[85%] px-5 gap-x-3 justify-end'>
        <Button title={'Gerar Pré-venda'} onClick={GerarPV}>
          <FontAwesomeIcon
            icon={faFileInvoiceDollar}
            className={'text-emsoft_light-main mr-2'}
            size='xl'
          />
          Gerar Pré-venda
        </Button>
        <Button className='bg-red-700 hover:bg-red-500' title={'Voltar'}>
          <Link href={`/app/budgets/${orc.ORCAMENTO}`}>
            <FontAwesomeIcon
              icon={faTimes}
              className={'text-emsoft_light-main mr-2'}
              size='xl'
            />
            Voltar
          </Link>
        </Button>
      </footer>
    </section>
  );
};

export default FormEditPreSale;
