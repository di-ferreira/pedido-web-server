import { iCliente } from '@/@types/Cliente';
import { iOrcamento } from '@/@types/Orcamento';
import DataTableItensBudget from '@/components/budgets/budgetItens/DataTable';
import { Input } from '@/components/ui/input';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

interface iFormBudget {
  orc: iOrcamento;
}

function FormBudget({ orc }: iFormBudget) {
  const cliente = orc.CLIENTE as iCliente | undefined;

  return (
    <section className='flex flex-col w-full gap-4 h-full'>
      <h1
        className={`text-2xl md:text-4xl font-bold mt-5 py-1 px-3 
          border-b-2 text-emsoft_dark-text
       border-emsoft_orange-main`}
      >
        Orçamento {orc.ORCAMENTO}
      </h1>

      <div className='flex w-full flex-col overflow-x-hidden overflow-y-auto'>
        {cliente && (
          <div className='flex flex-col md:flex-row gap-3 w-full px-5 py-2 flex-wrap md:flex-nowrap'>
            <Input
              labelText='CÓDIGO'
              labelPosition='top'
              value={cliente.CLIENTE}
              className='w-full md:w-[10%] h-7'
              disabled
            />
            <Input
              labelText='NOME'
              labelPosition='top'
              value={cliente.NOME}
              className='w-full md:w-[40%] h-7'
              disabled
            />
            <Input
              labelText='CPF/CNPJ'
              labelPosition='top'
              value={cliente.CIC}
              className='w-full md:w-[20%] h-7'
              disabled
            />

            <Input
              labelText='TELEFONE'
              labelPosition='top'
              name='TELEFONE'
              value={cliente.TELEFONE}
              className='w-full md:w-[20%] h-7'
              disabled
            />

            <Input
              labelText='ENDEREÇO'
              labelPosition='top'
              name='CLIENTE.ENDERECO'
              value={cliente.ENDERECO}
              className='w-full md:w-[30%] h-7'
              disabled
            />
            <Input
              labelText='BAIRRO'
              labelPosition='top'
              name='CLIENTE.BAIRRO'
              value={cliente.BAIRRO}
              className='w-full md:w-[24%] h-7'
              disabled
            />

            <Input
              labelText='CIDADE'
              labelPosition='top'
              name='CLIENTE.CIDADE'
              value={cliente.CIDADE}
              className='w-full md:w-[15%] h-7'
              disabled
            />
            <Input
              labelText='UF'
              labelPosition='top'
              name='CLIENTE.UF'
              value={cliente.UF}
              className='w-full md:w-[10%] h-7'
              disabled
            />
            <Input
              labelText='CEP'
              labelPosition='top'
              name='CLIENTE.CEP'
              value={cliente.CEP}
              className='w-full md:w-[10%] h-7'
              disabled
            />
          </div>
        )}

        <div className='flex gap-4 w-full mt-2'>
          <DataTableItensBudget orc={orc} />
        </div>
      </div>

      <div className='flex gap-4 w-full px-5 py-0 flex-wrap justify-end'>
        <Link
          href={`/app/budgets`}
          className='text-red-700 hover:text-red-500 font-bold'
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

export default FormBudget;

