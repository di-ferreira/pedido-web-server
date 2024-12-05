import React from 'react';
import { ImSpinner9 } from 'react-icons/im';

export const Loading: React.FC = () => {
  return (
    <span className='flex flex-col justify-center items-center w-full min-h-[500px]'>
      <ImSpinner9 className='w-full h-24 animate-colorChange' />
      <p className='text-xl'>Carregando...</p>
    </span>
  );
};

