import React from 'react';
import { iCliente } from '../../../../@types/Cliente';
import { fetchClient } from '../../../../lib/fetchClient/index';

interface iCustomerPage {
  params: { id: number };
}

export async function generateStaticParams() {
  const clientes = await fetchClient(`/Clientes$top=15`).then((res) =>
    res.json()
  );

  return clientes.map((cliente: iCliente) => ({
    id: cliente.CLIENTE,
  }));
}

const Customers: React.FC<iCustomerPage> = ({ params }) => {
  return (
    <>
      <h1>{params.id}</h1>
    </>
  );
};

export default Customers;

