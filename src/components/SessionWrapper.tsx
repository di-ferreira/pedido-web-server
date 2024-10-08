import { getCookie } from 'cookies-next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

const SessionWrapper: React.FC<Props> = async ({ children }) => {
  const tokenCookie = getCookie('token', { cookies });

  if (tokenCookie === undefined) {
    redirect('/auth');
  }
  return (
    <main className='flex flex-col w-full overflow-hidden min-h-full bg-light-surface'>
      {children}
    </main>
  );
};

export default SessionWrapper;

