'use client';
import { iCliente } from '@/@types/Cliente';
import { iOrcamento } from '@/@types/Orcamento';
import { iColumnType } from '@/@types/Table';
import { iVendedor } from '@/@types/Vendedor';
import { NewOrcamento } from '@/app/actions/orcamento';
import { MaskCnpjCpf } from '@/lib/utils';
import {
  faBan,
  faCheck,
  faFileLines,
  faUserAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React from 'react';

const RenderIconBloqueado = (value: string): JSX.Element => {
  if (value === 'S')
    return <FontAwesomeIcon icon={faBan} className='text-red-700' size='xl' />;
  return (
    <FontAwesomeIcon icon={faCheck} className='text-green-800' size='xl' />
  );
};

export const headers: iColumnType<iCliente>[] = [
  {
    key: 'CLIENTE',
    title: 'CÓDIGO',
    width: '10rem',
  },
  {
    key: 'NOME',
    title: 'NOME',
    width: '20rem',
  },
  {
    key: 'BLOQUEADO',
    title: 'BLOQUEADO',
    width: '11rem',
    isHideMobile: true,
    render: (_, item) =>
      item.BLOQUEADO && <>{RenderIconBloqueado(String(item.BLOQUEADO))}</>,
  },
  {
    key: 'CIC',
    title: 'CPF/CNPJ',
    width: '20rem',
    render: (_, item) => <>{MaskCnpjCpf(item.CIC)}</>,
  },
  {
    key: 'ENDERECO',
    title: 'ENDEREÇO',
    isHideMobile: true,
    width: '20rem',
  },
  {
    key: 'BAIRRO',
    title: 'BAIRRO',
    isHideMobile: true,
    width: '20rem',
  },
  {
    key: 'CIDADE',
    title: 'CIDADE',
    isHideMobile: true,
    width: '20rem',
  },
  {
    key: 'UF',
    title: 'UF',
    isHideMobile: true,
    width: '7rem',
  },
];

