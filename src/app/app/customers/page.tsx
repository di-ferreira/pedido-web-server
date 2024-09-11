import { GetClienteFromVendedor } from '@/app/actions/cliente';
import React from 'react';

const Customers: React.FC = async () => {
  const data = await GetClienteFromVendedor({
    top: 50,
  });
  console.log('cliente page', data);
  return (
    <>
      <h1>Customers</h1>
    </>
  );
};

export default Customers;

