'use client';
import { iCredito } from '@/@types';
import { iCliente } from '@/@types/Cliente';
import { iOrcamento } from '@/@types/Orcamento';
import { iVendedor } from '@/@types/Vendedor';
import { getErrorMessage } from '@/lib/utils';
import { GetCliente, GetFinanceiroCliente } from '@/app/actions/cliente';
import { NewOrcamento } from '@/app/actions/orcamento';
import ToastNotify from '@/components/ToastNotify';
import { Button } from '@/components/ui/button';
import {
  faArrowLeft,
  faFileLines,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBudget } from '@/store';
import CustomerInfoSection from './CustomerInfoSection';
import CustomerMedal from './CustomerMedal';
import FinanceiroSection from './FinanceiroSection';

interface iCustomerPage {
  params: { id: number };
}

function Customers({ params }: iCustomerPage) {
  const router = useRouter();
  const { isLoading, setCurrent } = useBudget();
  const [Customer, setcustomer] = useState<iCliente>({} as iCliente);
  const [ContasAtrazadas, setContasAtrazadas] = useState(0);
  const [ContasAVencer, setContasAVencer] = useState(0);
  const [ContasAbertas, setContasAbertas] = useState(0);
  const [TotalCreditos, setTotalCreditos] = useState(0);
  const [LimiteCredito, setLimiteCredito] = useState(0);
  const [ListaDebitos, setListaDebitos] = useState<iCredito[]>([]);
  const [ListaDebitosNaoVencidos, setListaDebitosNaoVencidos] = useState<iCredito[]>([]);
  const [ListaCreditos, setListaCreditos] = useState<iCredito[]>([]);
  const [SaldoCompra, setSaldoCompra] = useState<number>(0);

  const loadData = async () => {
    try {
      const resultFinanceiro = await GetFinanceiroCliente(params.id);

      if (resultFinanceiro.error !== undefined) {
        throw new Error(resultFinanceiro.error.message);
      }

      const financeiro = resultFinanceiro.value!;

      const customer = await GetCliente(params.id);

      setcustomer((old) => customer.value!);
      setLimiteCredito((old) => financeiro.LimiteCredito);
      setContasAtrazadas((old) => financeiro.ContasAtrazadas);
      setContasAVencer((old) => financeiro.ContasAVencer);
      setContasAbertas((old) => financeiro.ContasAbertas);
      setListaDebitosNaoVencidos((old) => financeiro.ListaDebitosNaoVencidos);
      setListaDebitos((old) => financeiro.ListaDebitos);
      setTotalCreditos((old) => financeiro.TotalCreditos);
      setListaCreditos((old) => financeiro.ListaCreditos);
      setSaldoCompra((old) => financeiro.SaldoCompra);
    } catch (err) {
      ToastNotify({ message: getErrorMessage(err), type: 'error' });
    }
  };

  useEffect(() => {
    setCurrent({} as unknown as iOrcamento);
    loadData();
  }, []);

  if (!Customer) return <p>Failed to load customer.</p>;

  const NewAddOrcamento: iOrcamento = {
    ORCAMENTO: 0,
    TOTAL: 0.0,
    CLIENTE: {} as iCliente,
    VENDEDOR: {} as iVendedor,
    COM_FRETE: 'N',
    ItensOrcamento: [],
  };

  async function GerarOrcamento() {
    try {
      const result = await NewOrcamento({
        ...NewAddOrcamento,
        CLIENTE: Customer!,
        TABELA: Customer!.Tabela,
      });

      if (result.error) {
        const isWarning =
          result.error.code === 'SOLICITADO' ||
          result.error.code === 'AGUARDANDO_ERP';
        ToastNotify({
          message: result.error.message,
          type: isWarning ? 'warning' : 'error',
        });
        return;
      }

      if (result.value) {
        setCurrent(result.value);
        router.push(`/app/budgets/${result.value.ORCAMENTO}`);
      }
    } catch (err) {
      ToastNotify({
        message: getErrorMessage(err),
        type: 'error',
      });
    }
  }

  return (
    <section className='flex flex-col gap-4 w-full h-full'>
      <h1
        className={`flex items-center  gap-x-3 text-4xl font-bold mt-5 py-1 px-3 
          border-b-2 text-emsoft_dark-text
        border-emsoft_orange-main`}
      >
        Cliente {Customer.CLIENTE} <CustomerMedal customer={Customer} />{' '}
        <Button
          className='w-40 p-3 bg-emsoft_orange-main hover:bg-emsoft_orange-light tablet-portrait:h-14 tablet-portrait:text-2xl'
          type='button'
          disabled={isLoading}
          onClick={GerarOrcamento}
          title='Gerar Orçamento'
        >
          Gerar Orçamento
          <FontAwesomeIcon
            icon={isLoading ? faSpinner : faFileLines}
            spinPulse={isLoading}
            className='h-full ml-3'
          />
        </Button>
      </h1>

      <CustomerInfoSection customer={Customer} />

      <h2
        className={`flex gap-x-3 text-2xl font-bold mt-5 py-1 px-3 
          border-b-2 text-emsoft_dark-text
        border-emsoft_orange-main`}
      >
        Financeiro
      </h2>
      <FinanceiroSection
        LimiteCredito={LimiteCredito}
        ContasAtrazadas={ContasAtrazadas}
        ContasAVencer={ContasAVencer}
        ContasAbertas={ContasAbertas}
        TotalCreditos={TotalCreditos}
        SaldoCompra={SaldoCompra}
        ListaDebitos={ListaDebitos}
        ListaDebitosNaoVencidos={ListaDebitosNaoVencidos}
        ListaCreditos={ListaCreditos}
      />

      <div className='flex gap-4 w-full px-5 py-0 flex-wrap justify-end'>
        <Link
          href={`/app/customers`}
          className='text-red-700 hover:text-red-500 font-bold px-6 py-3'
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            size='xl'
            title='Voltar'
            className='mr-3'
          />
          Voltar
        </Link>
      </div>
    </section>
  );
}

export default Customers;
