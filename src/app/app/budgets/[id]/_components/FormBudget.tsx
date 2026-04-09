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
  return (
    <section className='flex flex-col w-full gap-4 h-full'>
      <h1
        className={`text-4xl font-bold mt-5 py-1 px-3 
          border-b-2 text-emsoft_dark-text
       border-emsoft_orange-main`}
      >
        Orçamento {orc.ORCAMENTO}
      </h1>

      <div className='flex w-full h-[75vh] flex-col overflow-x-hidden overflow-y-auto'>
        <div className='flex gap-3 w-full h-[20%] px-5 py-0 flex-wrap tablet-portrait:h-auto tablet-portrait:gap-y-6'>
          <Input
            labelText='CÓDIGO'
            labelPosition='top'
            value={(orc.CLIENTE as iCliente).CLIENTE}
            className='w-[10%] h-7'
            disabled
          />
          <Input
            labelText='NOME'
            labelPosition='top'
            value={(orc.CLIENTE as iCliente).NOME}
            className='w-[40%] h-7'
            disabled
          />
          <Input
            labelText='CPF/CNPJ'
            labelPosition='top'
            value={(orc.CLIENTE as iCliente).CIC}
            className='w-[20%] h-7'
            disabled
          />

          <Input
            labelText='TELEFONE'
            labelPosition='top'
            name='TELEFONE'
            value={(orc.CLIENTE as iCliente).TELEFONE}
            className='w-[20%] h-7'
            disabled
          />

          <Input
            labelText='ENDEREÇO'
            labelPosition='top'
            name='CLIENTE.ENDERECO'
            value={(orc.CLIENTE as iCliente).ENDERECO}
            className='w-[30%] h-7'
            disabled
          />
          <Input
            labelText='BAIRRO'
            labelPosition='top'
            name='CLIENTE.BAIRRO'
            value={(orc.CLIENTE as iCliente).BAIRRO}
            className='w-[24%] h-7'
            disabled
          />

          <Input
            labelText='CIDADE'
            labelPosition='top'
            name='CLIENTE.CIDADE'
            value={(orc.CLIENTE as iCliente).CIDADE}
            className='w-[15%] h-7'
            disabled
          />
          <Input
            labelText='UF'
            labelPosition='top'
            name='CLIENTE.UF'
            value={(orc.CLIENTE as iCliente).UF}
            className='w-[10%] h-7'
            disabled
          />
          <Input
            labelText='CEP'
            labelPosition='top'
            name='CLIENTE.CEP'
            value={(orc.CLIENTE as iCliente).CEP}
            className='w-[10%] h-7'
            disabled
          />
        </div>

        <div className='flex gap-4 w-full h-[80%] mt-[2%] tablet-portrait:h-[50%]'>
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

