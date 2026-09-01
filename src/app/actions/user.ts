'use server';
import { ResponseType, userLogin } from '@/@types';
import { iVendedor } from '@/@types/Vendedor';
import { timingSafeEqual } from 'crypto';
import { CustomFetch } from '@/services/api';
import { getCookie, requireAuth, setCookie } from '.';

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function LoginUser(
  user: userLogin,
): Promise<ResponseType<iVendedor>> {
  const resultVenda = await vendaLogin();

  if (resultVenda.value === undefined) {
    return { error: resultVenda.error };
  }

  const token = resultVenda.value;

  const vendedor: ResponseType<iVendedor> = await getVendedor({
    token,
    user: user.vendedor,
  });

  if (vendedor.value === undefined) {
    return { error: vendedor.error };
  }

  const verifyPassword = safeCompare(vendedor.value.SENHA, user.password);

  if (!verifyPassword)
    return {
      error: { code: 'unauthorized', message: 'User or password invalid!' },
    };

  const resultLoginVendedor = await userVendaLogin(
    {
      vendedor: vendedor.value.VENDEDOR,
      password: vendedor.value.SENHA,
    },
    token,
  );

  if (resultLoginVendedor.error !== undefined) {
    return { error: resultLoginVendedor.error };
  }
  const vendedorResult: ResponseType<iVendedor> = {
    value: {
      VENDEDOR: vendedor.value.VENDEDOR,
      NOME: vendedor.value.NOME,
      CPF: vendedor.value.CPF,
      IDENTIDADE: vendedor.value.IDENTIDADE,
      ATIVO: vendedor.value.ATIVO,
      VENDA: vendedor.value.VENDA,
      TIPO_VENDEDOR: vendedor.value.TIPO_VENDEDOR
        ? vendedor.value.TIPO_VENDEDOR
        : 'E',
      TABELAS_PERMITIDAS: vendedor.value.TABELAS_PERMITIDAS,
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
    },
  };
  await setCookie('token', token);

  await setCookie('user', String(vendedor.value.VENDEDOR));

  return { value: vendedorResult.value };
}

async function vendaLogin(): Promise<ResponseType<string>> {
  const data = await CustomFetch<ResponseType<string>>(
    '/ServiceSistema/Login',
    {
      body: JSON.stringify({
        usuario: process.env.VENDA_LOGIN,
        senha: process.env.VENDA_PASSWORD,
      }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  );

  return data.body!;
}

async function userVendaLogin(
  user: userLogin,
  token: string,
): Promise<ResponseType<string>> {
  const data = await CustomFetch<ResponseType<string>>(
    '/ServiceSistema/LoginVendedor',
    {
      body: JSON.stringify({
        codigo: Number(user.vendedor),
        senha: String(user.password),
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${token}`,
      },
    },
  );

  return data.body!;
}

async function getVendedor(data: {
  token: string;
  user: number;
}): Promise<ResponseType<iVendedor>> {
  const responseData = await CustomFetch(`/Colaboradores(${data.user})`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${data.token}`,
    },
  });
  if (responseData.status !== 200) {
    return {
      value: undefined,
      error: {
        code: String(responseData.status),
        message: String(responseData.statusText),
      },
    };
  }
  return {
    value: responseData.body as iVendedor,
    error: undefined,
  };
}

export async function getVendedorAction(): Promise<ResponseType<iVendedor>> {
  const auth = await requireAuth();
  if (auth.error) return { error: auth.error };
  const tokenCookie = auth.value!;
  const userCookie = await getCookie('user');

  const responseData = await CustomFetch(`/Colaboradores(${userCookie})`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${tokenCookie}`,
    },
  });
  if (responseData.status !== 200) {
    return {
      value: undefined,
      error: {
        code: String(responseData.status),
        message: String(responseData.statusText),
      },
    };
  }
  return {
    value: {
      VENDEDOR: (responseData.body as iVendedor).VENDEDOR,
      NOME: (responseData.body as iVendedor).NOME,
      CPF: (responseData.body as iVendedor).CPF,
      IDENTIDADE: (responseData.body as iVendedor).IDENTIDADE,
      ATIVO: (responseData.body as iVendedor).ATIVO,
      VENDA: (responseData.body as iVendedor).VENDA,
      TIPO_VENDEDOR: (responseData.body as iVendedor).TIPO_VENDEDOR,
      TABELAS_PERMITIDAS: (responseData.body as iVendedor).TABELAS_PERMITIDAS,
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
    },
    error: undefined,
  };
}

