import { GetCliente } from '@/app/actions/cliente';
import { Input } from '@/components/ui/input';
import { MaskCnpjCpf } from '@/lib/utils';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React from 'react';

interface iCustomerPage {
  params: { id: number };
}

const Customers: React.FC<iCustomerPage> = async ({ params }) => {
  const customer = await GetCliente(params.id);

  if (!customer.value) return <p>Failed to load customer.</p>;

  return (
    <section className='flex flex-col gap-4 w-full h-full'>
      <h1
        className={`text-4xl font-bold mt-5 py-1 px-3 
          border-b-2 text-emsoft_dark-text
       border-emsoft_orange-main`}
      >
        Cliente {customer.value.CLIENTE}
      </h1>

      <div className='flex gap-4 w-full h-full px-5 py-0 flex-wrap'>
        <Input
          labelText='NOME'
          labelPosition='top'
          value={customer.value.NOME}
          className='w-[55%]'
        />
        <Input
          labelText='EMAIL'
          labelPosition='top'
          value={customer.value.EMAIL}
          className='w-[20%]'
        />
        <Input
          labelText='TELEFONE'
          labelPosition='top'
          value={customer.value.TELEFONE}
          className='w-[20%]'
        />

        <Input
          labelText='CPF/CNPJ'
          labelPosition='top'
          value={MaskCnpjCpf(customer.value.CIC)}
          className='w-[25%]'
        />
        <Input
          labelText='BLOQUEADO'
          labelPosition='top'
          value={customer.value.BLOQUEADO === 'S' ? 'SIM' : 'NÃO'}
          className='w-[25%]'
        />
        <Input
          labelText='MOTIVO BLOQUEIO'
          labelPosition='top'
          value={customer.value.MOTIVO}
          className='w-[45%]'
        />

        <Input
          labelText='ENDEREÇO'
          labelPosition='top'
          value={customer.value.ENDERECO}
          className='w-[37.5%]'
        />
        <Input
          labelText='BAIRRO'
          labelPosition='top'
          value={customer.value.BAIRRO}
          className='w-[20%]'
        />
        <Input
          labelText='CIDADE'
          labelPosition='top'
          value={customer.value.CIDADE}
          className='w-[20%]'
        />
        <Input
          labelText='CIDADE'
          labelPosition='top'
          value={customer.value.UF}
          className='w-[5%]'
        />
        <Input
          labelText='CEP'
          labelPosition='top'
          value={customer.value.CEP}
          className='w-[10%]'
        />

        <Input
          labelText='TIPO DE CLIENTE'
          labelPosition='top'
          value={customer.value.TIPO_CLIENTE}
          className='w-[10%]'
        />
        <Input
          labelText='USAR LIMITE'
          labelPosition='top'
          value={customer.value.USARLIMITE === 'S' ? 'SIM' : 'NÃO'}
          className='w-[10%]'
        />
        <Input
          labelText='LIMITE CLIENTE'
          labelPosition='top'
          value={
            customer.value.LIMITE
              ? customer.value.LIMITE.toLocaleString('pt-br', {
                  style: 'currency',
                  currency: 'BRL',
                })
              : Number(0).toLocaleString('pt-br', {
                  style: 'currency',
                  currency: 'BRL',
                })
          }
          className='w-[10%]'
        />
      </div>
      <div className='flex gap-4 w-full px-5 py-0 flex-wrap justify-end'>
        <Link
          href={`/app/customers`}
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
      <p>{JSON.stringify(customer.value)}</p>
    </section>
  );
};

export default Customers;

