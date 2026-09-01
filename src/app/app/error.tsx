'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function AppErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex flex-col items-center justify-center min-h-[50vh] p-8'>
      <h2 className='text-2xl font-bold text-emsoft_danger-dark mb-2'>
        Erro ao carregar a página
      </h2>
      <p className='text-base text-gray-600 mb-4'>
        {error.message || 'Ocorreu um erro inesperado.'}
      </p>
      <button
        onClick={reset}
        className='px-4 py-2 bg-emsoft_primary text-white rounded-md hover:opacity-90 transition-opacity'
      >
        Tentar novamente
      </button>
    </div>
  );
}

export default AppErrorPage;
