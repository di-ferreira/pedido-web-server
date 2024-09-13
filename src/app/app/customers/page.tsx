import DataTableCustomer from '@/components/customers/DataTable';
import React, { Suspense } from 'react';

const Customers: React.FC = () => {
  return (
    <div className='flex flex-col w-full h-[calc(100vh-74px)] overflow-x-hidden overflow-y-auto'>
      <h1>Customers</h1>
      <section className='flex flex-col w-full h-full overflow-x-hidden overflow-y-scroll'>
        <Suspense fallback={<span>Carregando...</span>}>
          <DataTableCustomer />
        </Suspense>
      </section>
    </div>
  );
};

export default Customers;

