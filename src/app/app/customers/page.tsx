import DataTableCustomer from '@/components/customers/DataTable';
import React, { Suspense } from 'react';

const Customers: React.FC = () => {
  return (
    <div className='flex flex-col w-full h-[calc(100vh-74px)] overflow-x-hidden overflow-y-auto'>
      <section className='flex flex-col w-full h-full overflow-x-hidden overflow-y-scroll'>
        <DataTableCustomer />
      </section>
    </div>
  );
};

export default Customers;

