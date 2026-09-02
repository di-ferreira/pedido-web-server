'use client';
import { iCliente } from '@/@types/Cliente';
import { Input } from '@/components/ui/input';
import { MaskCnpjCpf } from '@/lib/utils';

interface iCustomerInfoSection {
  customer: iCliente;
}

const CustomerInfoSection = ({ customer }: iCustomerInfoSection) => {
  return (
    <div className='flex gap-4 w-full h-full px-5 py-0 flex-wrap'>
      <Input
        labelText='NOME'
        labelPosition='top'
        value={customer.NOME}
        className='w-[35%] tablet-portrait:w-[45%]'
      />
      <Input
        labelText='EMAIL'
        labelPosition='top'
        value={customer.EMAIL}
        className='w-[20%] tablet-portrait:w-[45%]'
      />
      <Input
        labelText='TELEFONE'
        labelPosition='top'
        value={customer.TELEFONE}
        className='w-[15%] tablet-portrait:w-[45%]'
      />
      <Input
        labelText='CPF/CNPJ'
        labelPosition='top'
        value={MaskCnpjCpf(customer.CIC)}
        className='w-[24%] tablet-portrait:w-[45%]'
      />
      <Input
        labelText='ENDEREÇO'
        labelPosition='top'
        value={customer.ENDERECO}
        className='w-[37.5%] tablet-portrait:w-[45%]'
      />
      <Input
        labelText='BAIRRO'
        labelPosition='top'
        value={customer.BAIRRO}
        className='w-[20%] tablet-portrait:w-[45%]'
      />
      <Input
        labelText='CIDADE'
        labelPosition='top'
        value={customer.CIDADE}
        className='w-[20%] tablet-portrait:w-[25%]'
      />
      <Input
        labelText='UF'
        labelPosition='top'
        value={customer.UF}
        className='w-[5%] tablet-portrait:w-[10%]'
      />
      <Input
        labelText='CEP'
        labelPosition='top'
        value={customer.CEP}
        className='w-[10%] tablet-portrait:w-[20%]'
      />
      <Input
        labelText='TIPO DE CLIENTE'
        labelPosition='top'
        value={customer.TIPO_CLIENTE}
        className='w-[10%] tablet-portrait:w-[20%]'
      />
      <Input
        labelText='TABELA'
        labelPosition='top'
        value={customer.Tabela}
        className='w-[10%] tablet-portrait:w-[20%]'
      />
      <Input
        labelText='USAR LIMITE'
        labelPosition='top'
        value={customer.USARLIMITE === 'S' ? 'SIM' : 'NÃO'}
        className='w-[10%] tablet-portrait:w-[15%]'
      />
      <Input
        labelText='LIMITE CLIENTE'
        labelPosition='top'
        value={
          customer.LIMITE
            ? customer.LIMITE.toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL',
              })
            : Number(0).toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL',
              })
        }
        className='w-[10%] tablet-portrait:w-[20%]'
      />
      <Input
        labelText='LIMITE CHEQUE'
        labelPosition='top'
        value={
          customer.LIMITE_CHEQUE
            ? customer.LIMITE_CHEQUE.toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL',
              })
            : Number(0).toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL',
              })
        }
        className='w-[10%] tablet-portrait:w-[15%]'
      />
      <Input
        labelText='SOMENTE NFE'
        labelPosition='top'
        value={customer.SOMENTE_NFE === 'S' ? 'SIM' : 'NÃO'}
        className='w-[10%] tablet-portrait:w-[15%]'
      />
      <Input
        labelText='CARTEIRA'
        labelPosition='top'
        value={customer.CARTEIRA === 'S' ? 'SIM' : 'NÃO'}
        className='w-[10%] tablet-portrait:w-[15%]'
      />
      <Input
        labelText='DDA'
        labelPosition='top'
        value={customer.DDA === 'S' ? 'SIM' : 'NÃO'}
        className='w-[10%] tablet-portrait:w-[15%]'
      />
      <Input
        labelText='BLOQUEADO'
        labelPosition='top'
        value={customer.BLOQUEADO === 'S' ? 'SIM' : 'NÃO'}
        className='w-[25%] tablet-portrait:w-[20%]'
      />
      <Input
        labelText='MOTIVO BLOQUEIO'
        labelPosition='top'
        value={customer.MOTIVO}
        className='w-[45%] tablet-portrait:w-[35%]'
      />
    </div>
  );
};

export default CustomerInfoSection;
