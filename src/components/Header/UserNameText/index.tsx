'use client';
import { iVendedor } from '@/@types';
import { getVendedorAction } from '@/app/actions/user';
import useSWR from 'swr';

const UserNameText = () => {
  const { data: user, isLoading } = useSWR(
    'getVendedorAction',
    getVendedorAction
  );

  if (isLoading) return <span>Carregando nome do vendedor...</span>;

  if (user === undefined)
    console.error('Error:Falha ao carregar nome do vendedor.');

  if (user === undefined || user.value === undefined)
    return <span>Failed to load user.</span>;

  const vendedor: iVendedor = {
    VENDEDOR: user.value.VENDEDOR,
    NOME: user.value.NOME,
    CPF: user.value.CPF,
    IDENTIDADE: user.value.IDENTIDADE,
    ATIVO: user.value.ATIVO,
    VENDA: user.value.VENDA,
    TIPO_VENDEDOR: user.value.TIPO_VENDEDOR,
    TABELAS_PERMITIDAS: user.value.TABELAS_PERMITIDAS,
  };

  return (
    <div className='flex flex-1 items-center mr-4 justify-center'>
      <span>{vendedor.NOME}</span>
    </div>
  );
};

export default UserNameText;

