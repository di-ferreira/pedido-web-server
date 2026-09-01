'use client';

import { useEffect } from 'react';

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className='flex flex-col items-center justify-center min-h-screen p-8'>
          <h2 className='text-2xl font-bold text-red-600 mb-2'>
            Erro no servidor
          </h2>
          <p className='text-base text-gray-600 mb-4'>
            {error.message || 'Ocorreu um erro inesperado no servidor.'}
          </p>
          <button
            onClick={reset}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:opacity-90 transition-opacity'
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}

export default GlobalErrorPage;
