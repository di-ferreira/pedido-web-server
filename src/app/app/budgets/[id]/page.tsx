'use client';
import { GetOrcamento } from '@/app/actions/orcamento';
import ToastNotify from '@/components/ToastNotify';
import { useBudget } from '@/store';
import { useEffect, useState } from 'react';
import FormBudget from './_components/FormBudget';

interface iBudgetPage {
  params: { id: number };
}

function Budget({ params }: iBudgetPage) {
  const budget = useBudget();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!budget.current || budget.current.ORCAMENTO !== params.id) {
      GetOrcamento(params.id).then((result) => {
        if (result.value) {
          budget.setCurrent(result.value);
        } else {
          const msg = result.error?.message ?? 'Falha ao carregar orçamento.';
          setError(msg);
          ToastNotify({ message: msg, type: 'error' });
        }
      });
    }
  }, []);

  if (error) {
    return <p className='text-red-600 p-4'>{error}</p>;
  }

  return <FormBudget orc={budget.current} />;
}

export default Budget;

