'use client';
import { iCliente } from '@/@types/Cliente';
import { RiMedalFill } from 'react-icons/ri';

interface iCustomerMedal {
  customer: iCliente;
}

const medalColors: Record<string, string> = {
  BRONZE: 'text-[#cc7700]',
  PRATA: 'text-[#B6C2CC]',
  OURO: 'text-[#FFC600]',
  FIEL: 'text-[#115C55]',
};

const CustomerMedal = ({ customer }: iCustomerMedal) => {
  const color = medalColors[customer.TIPO_CLIENTE];

  if (!color) return null;

  return (
    <RiMedalFill
      className={`${color} w-[35px] h-[35px] rounded-full p-1`}
      style={{
        stroke: '#474747',
        strokeWidth: '1px',
      }}
      title={customer.TIPO_CLIENTE}
      aria-label={`Cliente ${customer.TIPO_CLIENTE}`}
    />
  );
};

export default CustomerMedal;
