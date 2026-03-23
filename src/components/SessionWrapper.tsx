import { KEY_NAME_TOKEN } from '@/constants';
import { cn } from '@/lib/utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';
import { Toaster } from './ui/toaster';

interface Props {
  children: React.ReactNode;
  classname?: string;
}

const SessionWrapper = ({ children, classname }: Props) => {
  const tokenCookie = cookies().get(`${KEY_NAME_TOKEN}token`)?.value;

  if (tokenCookie === undefined) {
    redirect('/auth');
  }
  return (
    <>
      <Toaster />
      <main
        className={cn(
          'flex flex-col w-full overflow-x-hidden overflow-y-auto  min-h-full bg-gray-300',
          classname,
        )}
      >
        {children}
      </main>
    </>
  );
};

export default SessionWrapper;

