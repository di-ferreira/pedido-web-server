import DataTablePreSale from '@/components/preSale/DataTable';
import React from 'react';

const PreSales: React.FC = () => {
  return (
    <div className='flex flex-col w-full h-[calc(100vh-74px)] overflow-x-hidden overflow-y-auto'>
      <section className='flex flex-col w-full h-full overflow-x-hidden overflow-y-scroll'>
        <DataTablePreSale />
      </section>
    </div>
  );
};

export default PreSales;

