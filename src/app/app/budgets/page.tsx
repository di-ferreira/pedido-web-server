import DataTableBudget from '@/components/budgets/DataTable';

const Budgets = () => {
  return (
    <div className='flex flex-col w-full h-[calc(100vh-74px)] overflow-x-hidden overflow-y-auto'>
      <section className='flex flex-col w-full h-full overflow-x-hidden overflow-y-scroll'>
        <DataTableBudget />
      </section>
    </div>
  );
};

export default Budgets;

