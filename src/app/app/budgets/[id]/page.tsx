import { GetOrcamento } from '@/app/actions/orcamento';
import DataTableItensBudget from '@/components/budgets/budgetItens/DataTable';
import { Input } from '@/components/ui/input';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React from 'react';

interface iBudgetPage {
  params: { id: number };
}

const Budget: React.FC<iBudgetPage> = async ({ params }) => {
  let budget = await GetOrcamento(params.id);

  if (!budget.value) return <p>Failed to load budget.</p>;

  return (
    <section className='flex flex-col w-full gap-4 h-full'>
      <h1
        className={`text-4xl font-bold mt-5 py-1 px-3 
          border-b-2 text-emsoft_dark-text
       border-emsoft_orange-main`}
      >
        Orçamento {budget.value.ORCAMENTO}
      </h1>

      <div className='flex w-full h-[75vh] flex-col overflow-x-hidden overflow-y-auto'>
        <div className='flex gap-3 w-full h-[40%] px-5 py-0 flex-wrap'>
          <Input
            labelText='CÓDIGO'
            labelPosition='top'
            value={budget.value.CLIENTE.CLIENTE}
            className='w-[10%]'
          />
          <Input
            labelText='NOME'
            labelPosition='top'
            value={budget.value.CLIENTE.NOME}
            className='w-[40%]'
          />
          <Input
            labelText='CPF/CNPJ'
            labelPosition='top'
            value={budget.value.CLIENTE.CIC}
            className='w-[20%]'
          />

          <Input
            labelText='TELEFONE'
            labelPosition='top'
            name='TELEFONE'
            value={budget.value.CLIENTE.TELEFONE}
            className='w-[20%]'
          />

          <Input
            labelText='ENDEREÇO'
            labelPosition='top'
            name='CLIENTE.ENDERECO'
            value={budget.value.CLIENTE.ENDERECO}
            className='w-[30%]'
          />
          <Input
            labelText='BAIRRO'
            labelPosition='top'
            name='CLIENTE.BAIRRO'
            value={budget.value.CLIENTE.BAIRRO}
            className='w-[24%]'
          />

          <Input
            labelText='CIDADE'
            labelPosition='top'
            name='CLIENTE.CIDADE'
            value={budget.value.CLIENTE.CIDADE}
            className='w-[15%]'
          />
          <Input
            labelText='UF'
            labelPosition='top'
            name='CLIENTE.UF'
            value={budget.value.CLIENTE.UF}
            className='w-[10%]'
          />
          <Input
            labelText='CEP'
            labelPosition='top'
            name='CLIENTE.CEP'
            value={budget.value.CLIENTE.CEP}
            className='w-[10%]'
          />
        </div>

        <div className='flex gap-4 w-full h-[70%]'>
          <DataTableItensBudget orc={budget.value} />
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
};

export default Budget;

