import { iCliente } from '@/@types/Cliente';
import {
  GetCliente,
  GetPGTOsAtrazados,
  GetPGTOsEmAberto,
  GetPGTOsNaoVencidos,
} from '@/app/actions/cliente';
import { Input } from '@/components/ui/input';
import { MaskCnpjCpf } from '@/lib/utils';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React from 'react';
import { RiMedalFill } from 'react-icons/ri';

interface iCustomerPage {
  params: { id: number };
}

const Customers: React.FC<iCustomerPage> = async ({ params }) => {
  const customer = await GetCliente(params.id);
  const emAtrazo = await GetPGTOsAtrazados(params.id);
  const naoVencidas = await GetPGTOsNaoVencidos(params.id);
  const emAberto = await GetPGTOsEmAberto(params.id);
  console.log('em aberto', emAberto);

  if (!customer.value) return <p>Failed to load customer.</p>;

  function verifyTypeCustomer(customer: iCliente) {
    if (customer.TIPO_CLIENTE == 'BRONZE') {
      return (
        <RiMedalFill
          className={`text-[#cc7700] w-[35px] h-[35px] rounded-full p-1`}
          style={{
            stroke: '#474747',
            strokeWidth: '1px',
          }}
          title={customer.TIPO_CLIENTE}
        />
      );
    }
    if (customer.TIPO_CLIENTE == 'PRATA') {
      return (
        <RiMedalFill
          className={`text-[#B6C2CC] w-[35px] h-[35px] rounded-full p-1`}
          style={{
            stroke: '#474747',
            strokeWidth: '1px',
          }}
          title={customer.TIPO_CLIENTE}
        />
      );
    }
    if (customer.TIPO_CLIENTE == 'OURO') {
      return (
        <RiMedalFill
          className={'text-[#FFC600] w-[35px] h-[35px] rounded-full p-1'}
          style={{
            stroke: '#474747',
            strokeWidth: '1px',
          }}
          title={customer.TIPO_CLIENTE}
        />
      );
    }
    if (customer.TIPO_CLIENTE == 'FIEL') {
      return (
        <RiMedalFill
          className={'text-[#115C55] w-[35px] h-[35px] rounded-full p-1'}
          style={{
            stroke: '#474747',
            strokeWidth: '1px',
          }}
          title={customer.TIPO_CLIENTE}
        />
      );
    }
  }

  return (
    <section className='flex flex-col gap-4 w-full h-full'>
      <h1
        className={`flex gap-x-3 text-4xl font-bold mt-5 py-1 px-3 
          border-b-2 text-emsoft_dark-text
       border-emsoft_orange-main`}
      >
        Cliente {customer.value.CLIENTE} {verifyTypeCustomer(customer.value)}
      </h1>

      <div className='flex gap-4 w-full h-full px-5 py-0 flex-wrap'>
        <Input
          labelText='NOME'
          labelPosition='top'
          value={customer.value.NOME}
          className='w-[35%]'
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
          className='w-[15%]'
        />

        <Input
          labelText='CPF/CNPJ'
          labelPosition='top'
          value={MaskCnpjCpf(customer.value.CIC)}
          className='w-[24%]'
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
          labelText='TABELA'
          labelPosition='top'
          value={customer.value.Tabela}
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
        <Input
          labelText='LIMITE CHEQUE'
          labelPosition='top'
          value={
            customer.value.LIMITE_CHEQUE
              ? customer.value.LIMITE_CHEQUE.toLocaleString('pt-br', {
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
        <Input
          labelText='SOMENTE NFE'
          labelPosition='top'
          value={customer.value.SOMENTE_NFE === 'S' ? 'SIM' : 'NÃO'}
          className='w-[10%]'
        />
        <Input
          labelText='CARTEIRA'
          labelPosition='top'
          value={customer.value.CARTEIRA === 'S' ? 'SIM' : 'NÃO'}
          className='w-[10%]'
        />
        <Input
          labelText='DDA'
          labelPosition='top'
          value={customer.value.DDA === 'S' ? 'SIM' : 'NÃO'}
          className='w-[10%]'
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
      </div>
      <h2
        className={`flex gap-x-3 text-2xl font-bold mt-5 py-1 px-3 
          border-b-2 text-emsoft_dark-text
       border-emsoft_orange-main`}
      >
        Financeiro
      </h2>
      <div className='flex gap-4 w-full h-full px-5 py-0 flex-wrap'></div>

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
};

export default Customers;

