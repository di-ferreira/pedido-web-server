import { ImSpinner9 } from 'react-icons/im';

export const Loading = () => {
  return (
    <span
      role='status'
      aria-live='assertive'
      className='fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-90'
    >
      <ImSpinner9 className='w-full h-24 animate-colorChange' aria-hidden='true' />
      <p className='text-2xl text-white'>Carregando...</p>
    </span>
  );
};

