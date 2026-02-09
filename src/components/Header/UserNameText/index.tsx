'use client';
import { iVendedor } from '@/@types/Vendedor';
import { getVendedorAction } from '@/app/actions/user';
import useSWR from 'swr';

const UserNameText = () => {
  const { data: user, isLoading } = useSWR(
    'getVendedorAction',
    getVendedorAction,
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
    TIPO_VENDEDOR: user.value.TIPO_VENDEDOR ? user.value.TIPO_VENDEDOR : 'E',
    TABELAS_PERMITIDAS: user.value.TABELAS_PERMITIDAS,
    ENDERECO: '',
    BAIRRO: '',
    CIDADE: '',
    UF: '',
    CEP: '',
    TELEFONE: '',
    SENHA: '',
    ATUALIZAR: '',
    COMISSAO: 0,
    CTPS: '',
    FUNCAO: '',
    ADMISSAO: '',
    DEMISSAO: '',
    SALARIO: 0,
    VALE_TRANSPORTE: 0,
    NASCIMENTO: '',
    ESTADO_CIVIL: '',
    PIS: '',
    NACIONALIDADE: '',
    NATURALIDADE: '',
    CONJUGE: '',
    EMAIL: '',
    CELULAR: '',
    CARTAO_NUMERO: '',
    CARTAO_MATRICULA: '',
    META_MARKUP: 0,
    META_INDEXADOR: 0,
    SETOR: '',
  };

  return (
    <div className='flex flex-1 items-center mr-4 justify-center text-emsoft_light-main font-bold'>
      <span>{vendedor.NOME}</span>
    </div>
  );
};

export default UserNameText;

