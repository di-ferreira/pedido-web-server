import { GetOrcamento } from '@/app/actions/orcamento';
import { Input } from '@/components/ui/input';
import { MaskCnpjCpf } from '@/lib/utils';
import { faArrowLeft, faTurnDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React from 'react';

interface iBudgetPage {
  params: { id: number };
}

const Budget: React.FC<iBudgetPage> = async ({ params }) => {
  const budget = await GetOrcamento(params.id);
  // const customer = await GetCliente(params.id);

  if (!budget.value) return <p>Failed to load budget.</p>;

  return (
    <section className='flex flex-col gap-4 w-full h-full'>
      <h1
        className={`text-4xl font-bold mt-5 py-1 px-3 
          border-b-2 text-emsoft_dark-text
       border-emsoft_orange-main`}
      >
        Orçamento {budget.value.ORCAMENTO}
      </h1>

      <div className='flex gap-4 w-full h-full px-5 py-0 flex-wrap'>
        <Input
          labelText='NOME'
          labelPosition='top'
          value={budget.value.ORCAMENTO}
          className='w-[55%]'
        />
        {/* <Input
          labelText='EMAIL'
          labelPosition='top'
          value={budget.value.EMAIL}
          className='w-[20%]'
        />
        <Input
          labelText='TELEFONE'
          labelPosition='top'
          value={budget.value.TELEFONE}
          className='w-[20%]'
        />

        <Input
          labelText='CPF/CNPJ'
          labelPosition='top'
          value={MaskCnpjCpf(budget.value.CIC)}
          className='w-[25%]'
        />
        <Input
          labelText='BLOQUEADO'
          labelPosition='top'
          value={budget.value.BLOQUEADO === 'S' ? 'SIM' : 'NÃO'}
          className='w-[25%]'
        />
        <Input
          labelText='MOTIVO BLOQUEIO'
          labelPosition='top'
          value={budget.value.MOTIVO}
          className='w-[45%]'
        />

        <Input
          labelText='ENDEREÇO'
          labelPosition='top'
          value={budget.value.ENDERECO}
          className='w-[37.5%]'
        />
        <Input
          labelText='BAIRRO'
          labelPosition='top'
          value={budget.value.BAIRRO}
          className='w-[20%]'
        />
        <Input
          labelText='CIDADE'
          labelPosition='top'
          value={budget.value.CIDADE}
          className='w-[20%]'
        />
        <Input
          labelText='CIDADE'
          labelPosition='top'
          value={budget.value.UF}
          className='w-[5%]'
        />
        <Input
          labelText='CEP'
          labelPosition='top'
          value={budget.value.CEP}
          className='w-[10%]'
        />

        <Input
          labelText='TIPO DE CLIENTE'
          labelPosition='top'
          value={budget.value.TIPO_CLIENTE}
          className='w-[10%]'
        />
        <Input
          labelText='USAR LIMITE'
          labelPosition='top'
          value={budget.value.USARLIMITE === 'S' ? 'SIM' : 'NÃO'}
          className='w-[10%]'
        />
        <Input
          labelText='LIMITE CLIENTE'
          labelPosition='top'
          value={
            budget.value.LIMITE
              ? budget.value.LIMITE.toLocaleString('pt-br', {
                  style: 'currency',
                  currency: 'BRL',
                })
              : Number(0).toLocaleString('pt-br', {
                  style: 'currency',
                  currency: 'BRL',
                })
          }
          className='w-[10%]'
        /> */}
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

