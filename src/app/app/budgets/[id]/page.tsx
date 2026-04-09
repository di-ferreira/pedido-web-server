'use client';
import { GetOrcamento } from '@/app/actions/orcamento';
import { useBudget } from '@/store';
import { useEffect } from 'react';
import FormBudget from './_components/FormBudget';

interface iBudgetPage {
  params: { id: number };
}

function Budget({ params }: iBudgetPage) {
  const budget = useBudget();
  console.log('budget', budget.current);

  useEffect(() => {
    if (!budget.current || budget.current.ORCAMENTO !== params.id) {
      GetOrcamento(params.id).then((result) => {
        if (result.value) {
          budget.setCurrent(result.value);
        } else {
          return <p>Failed to load budget.</p>;
        }
      });
    }
  }, []);

  return <FormBudget orc={budget.current} />;
}

export default Budget;

