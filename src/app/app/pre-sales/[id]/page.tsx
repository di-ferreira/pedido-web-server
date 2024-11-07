import { iOrcamento } from '@/@types/Orcamento';
import {
  iCondicaoPgto,
  iFormaPgto,
  iParcelasPgto,
  iPreVenda,
  iTransportadora,
} from '@/@types/PreVenda';
import { GetOrcamento } from '@/app/actions/orcamento';
import { GetCondicaoPGTO, GetPreVenda } from '@/app/actions/preVenda';
import FormEditPreSale from '@/components/preSale/FormEditPreSale';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface ipreSalePage {
  params: { id: number };
}

const PreSale: React.FC<ipreSalePage> = async ({ params }) => {
  const orcamento = await GetOrcamento(params.id);

  if (!orcamento.value) return <p>Failed to load Pre-Sale.</p>;

  return <FormEditPreSale orc={orcamento.value} />;
};

export default PreSale;

