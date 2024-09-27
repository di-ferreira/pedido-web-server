'use server';
import { iVendedor, iVendedorSenha, ResponseType, userLogin } from '@/@types';
import { compareHash } from '@/lib/utils';
import { CustomFetch } from '@/services/api';
import { getCookie, setCookie } from '.';

export async function LoginUser(
  user: userLogin
): Promise<ResponseType<iVendedor>> {
  const resultVenda = await vendaLogin();
  if (resultVenda.value === undefined) {
    return { error: resultVenda.error };
  }

  const token = resultVenda.value;

  const vendedor: ResponseType<iVendedorSenha> = await getVendedor({
    token,
    user: user.vendedor,
  });

  if (vendedor.value === undefined) {
    return { error: vendedor.error };
  }

  const verifyPassword = compareHash(vendedor.value.SENHA, user.password);

  if (!verifyPassword)
    return {
      error: { code: 'unauthorized', message: 'User or password invalid!' },
    };

  const resultLoginVendedor = await userVendaLogin(
    {
      vendedor: vendedor.value.VENDEDOR,
      password: vendedor.value.SENHA,
    },
    token
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
      TIPO_VENDEDOR: vendedor.value.TIPO_VENDEDOR,
      TABELAS_PERMITIDAS: vendedor.value.TABELAS_PERMITIDAS,
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
    }
  );

  return data.body;
}

async function userVendaLogin(
  user: userLogin,
  token: string
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
    }
  );

  return data.body;
}

async function getVendedor(data: {
  token: string;
  user: number;
}): Promise<ResponseType<iVendedorSenha>> {
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
    value: responseData.body as iVendedorSenha,
    error: undefined,
  };
}

export async function getVendedorAction(): Promise<ResponseType<iVendedor>> {
  const tokenCookie = await getCookie('token');
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
    },
    error: undefined,
  };
}

