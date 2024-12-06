import { cn } from '@/lib/utils';
import { getCookie } from 'cookies-next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import { Toaster } from './ui/toaster';

interface Props {
  children: React.JSX.Element;
  classname?: string;
}

const SessionWrapper = async ({ children, classname }: Props) => {
  const tokenCookie = getCookie('token', { cookies });

  if (tokenCookie === undefined) {
    redirect('/auth');
  }
  return (
    <>
      <Toaster />
      <main
        className={cn(
          'flex flex-col w-full overflow-hidden  min-h-full bg-light-surface',
          classname
        )}
      >
        {children}
      </main>
    </>
  );
};

export default SessionWrapper;

