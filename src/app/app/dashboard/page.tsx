import { GetClientesPgtoEmAberto } from '@/app/actions/cliente';
import {
  getDataTotalVenda,
  getLastVenda,
  getVendasDashboard,
} from '@/app/actions/vendas';
import SessionWrapper from '@/components/SessionWrapper';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import LineChart from '@/components/ui/chart';
import { FormatToCurrency } from '@/lib/utils';
import {
  faDollarSign,
  faFileInvoiceDollar,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type VendaDashboard = {
  CLIENTE: string;
  TOTAL_VENDAS: number;
};

const Dashboard = async () => {
  const Vendas = await getVendasDashboard();
  const lastSell = await getLastVenda();
  const dataTotalSell = await getDataTotalVenda();
  const customerListDebit = await GetClientesPgtoEmAberto();
  let singleSeries = { name: 'Vendas', data: [10, 41, 35, 51, 49, 62, 69] };
  let categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  if (
    Vendas.value === undefined ||
    lastSell.value === undefined ||
    dataTotalSell.value === undefined
  ) {
    return <h1>Erro ao carregar dados</h1>;
  }

  console.log('clientes em debito', customerListDebit.value);

  const listaVendas: VendaDashboard[] = Vendas.value;
  singleSeries.data = [];
  categories = [];

  dataTotalSell.value?.map(
    (value: { TOTAL_MENSAL: number; MES: string; ANO: string }) => {
      singleSeries.data.push(value.TOTAL_MENSAL);
      categories.push(`${value.MES}/${value.ANO}`);
    }
  );

  return (
    <SessionWrapper classname={`p-4 gap-y-4`}>
      <section
        className={`flex flex-row w-full gap-x-4 tablet:flex-col tablet:gap-y-4`}
      >
        <Card
          className={`w-[33%] max-h-[80%] p-3 
                      tablet-landscape:w-full tablet-landscape:flex tablet-landscape:items-center tablet-landscape:justify-evenly
                      tablet-portrait:w-full tablet-portrait:flex tablet-portrait:items-center tablet-portrait:justify-evenly`}
        >
          <div>
            <CardHeader className='text-lg text-gray-600 p-0 flex-row items-center gap-x-3'>
              Número Total de Vendas <FontAwesomeIcon icon={faDollarSign} />
            </CardHeader>
            <CardDescription className='text-xs text-gray-500'>
              Quantidade Total de vendas nos ultimos 30 dias
            </CardDescription>
          </div>
          <CardContent
            className={`font-bold mt-2 tablet-landscape:text-2xl tablet-landscape:mt-5`}
          >
            {listaVendas ? listaVendas.length : 0}
          </CardContent>
        </Card>
        <Card
          className={`w-[33%] max-h-[80%] p-3 
                      tablet-landscape:w-full tablet-landscape:flex tablet-landscape:items-center tablet-landscape:justify-evenly
                      tablet-portrait:w-full tablet-portrait:flex tablet-portrait:items-center tablet-portrait:justify-evenly`}
        >
          <div>
            <CardHeader className='text-lg text-gray-600 p-0 flex-row items-center gap-x-3'>
              Total de Vendas <FontAwesomeIcon icon={faDollarSign} />
            </CardHeader>
            <CardDescription className='text-xs text-gray-500'>
              Total de vendas nos ultimos 30 dias
            </CardDescription>
          </div>
          <CardContent
            className={`font-bold mt-2 tablet-landscape:text-2xl tablet-landscape:mt-5`}
          >
            {FormatToCurrency(
              String(
                listaVendas
                  ? listaVendas.reduce(
                      (total, venda) => total + venda.TOTAL_VENDAS,
                      0
                    )
                  : 0
              )
            )}
          </CardContent>
        </Card>
        <Card
          className={`w-[31%] max-h-[80%] p-3 
                      tablet-landscape:w-full tablet-landscape:flex tablet-landscape:items-center tablet-landscape:justify-evenly
                      tablet-portrait:w-full tablet-portrait:flex tablet-portrait:items-center tablet-portrait:justify-evenly`}
        >
          <div className=''>
            <CardHeader className='text-lg text-gray-600 p-0 flex-row items-center gap-x-3'>
              Última Venda <FontAwesomeIcon icon={faFileInvoiceDollar} />
            </CardHeader>
            <CardDescription className='text-xs text-gray-500'>
              Útima Venda realizada no dia
            </CardDescription>
          </div>
          <CardContent
            className={`font-bold mt-2 tablet-landscape:text-2xl tablet-landscape:mt-5`}
          >
            {FormatToCurrency(String(lastSell.value.value[0].TOTAL))}
          </CardContent>
        </Card>
      </section>
      <section
        className={`flex flex-row w-full gap-x-4 tablet:flex-col tablet:gap-y-4 mt-[-1.5rem]`}
      >
        <Card
          className={`w-[59%] h-min p-3 tablet:w-full tablet:flex tablet:flex-col tablet:items-center`}
        >
          <CardHeader className='text-lg text-gray-600 p-0 flex-row items-center gap-x-3'>
            Gráfico de venda Mensal <FontAwesomeIcon icon={faDollarSign} />
          </CardHeader>
          <CardDescription className='text-xs text-gray-500'>
            Gráfico de vendas do vendedor dos últimos 30 dias
          </CardDescription>

          <CardContent className='font-bold mt-2 p-0 w-full'>
            <LineChart series={singleSeries} categories={categories} />
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
        <Card
          className={`w-[39%]  p-3  h-min tablet:w-full tablet:flex tablet:flex-col tablet:items-center`}
        >
          <CardHeader className='text-lg text-gray-600 p-0 flex-row items-center gap-x-3'>
            Venda Mensal por Cliente
            <FontAwesomeIcon icon={faDollarSign} />
          </CardHeader>
          <CardDescription className='text-xs text-gray-500'>
            Resumo de vendas filtrado por cliente
          </CardDescription>

          <CardContent className='flex flex-col mt-2 p-2 gap-y-2 w-full h-full'>
            {listaVendas &&
              listaVendas.map((v, idx) => (
                <div
                  key={idx}
                  className='flex justify-around items-end gap-x-3 h-5'
                >
                  <p className='text-ellipsis items-end text-sm w-[60%] h-full overflow-hidden'>
                    {v.CLIENTE}
                  </p>
                  <span className='flex items-end justify-end text-sm w-[40%] h-full overflow-hidden'>
                    {FormatToCurrency(String(v.TOTAL_VENDAS))}
                  </span>
                </div>
              ))}
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </section>
      <section
        className={`flex flex-row w-full gap-x-4 tablet:flex-col tablet:gap-y-4`}
      >
        <Card
          className={`w-[99%] p-3 h-min tablet:flex tablet:flex-col tablet:items-center`}
        >
          <CardHeader className='text-lg text-gray-600 p-0 flex-row items-center gap-x-3'>
            Clientes com boletos em aberto
            <FontAwesomeIcon icon={faDollarSign} />
          </CardHeader>
          <CardDescription className='text-xs text-gray-500'>
            Lista de clientes com boletos em aberto
          </CardDescription>

          <CardContent className='flex flex-col mt-2 p-2 gap-y-2 w-full h-full'>
            {customerListDebit &&
              customerListDebit.value?.map((v, idx) => (
                <div
                  key={idx}
                  className='flex justify-around items-end gap-x-3 h-5 odd:bg-gray-100 even:bg-gray-200'
                >
                  <p className='text-ellipsis items-end text-sm w-[60%] h-full overflow-hidden'>
                    {v.NOME_CLIENTE}
                  </p>
                  <span className='flex items-end justify-end text-sm w-[40%] h-full overflow-hidden'>
                    {FormatToCurrency(String(v.VALOR))}
                  </span>
                </div>
              ))}
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </section>
    </SessionWrapper>
  );
};

export default Dashboard;

