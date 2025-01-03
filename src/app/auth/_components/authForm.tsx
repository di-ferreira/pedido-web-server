'use client';
import { LoginUser } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateHash } from '@/lib/utils';
import useUser from '@/store';
import {
  faLock,
  faRightToBracket,
  faSpinner,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AuthForm() {
  const router = useRouter();
  const vendedorUser = useUser();
  const [isPendding, setIsPendding] = useState<boolean>(false);
  const [ErrorMessage, setErrorMessage] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setIsPendding(true);

    e.preventDefault();
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const vendedorCode = formData.get('vendedor');
    const vendedorPassword = String(formData.get('password'));
    const vendedorPasswordHashed = generateHash(vendedorPassword);

    const login = await LoginUser({
      vendedor: Number(vendedorCode),
      password: vendedorPasswordHashed,
    });

    if (login.value === undefined) {
      setErrorMessage('Erro ao efetuar login:' + login.error?.message);
    }

    if (login.value !== undefined) {
      vendedorUser.setCurrent(login.value);
      router.push('/app/dashboard');
    }
    setIsPendding(false);
  }

  return (
    <form onSubmit={handleSubmit} method='POST' className='w-full mt-8'>
      <Input
        name='vendedor'
        placeholder='Insira o código do vendedor'
        labelText='Vendedor'
        labelPosition='top'
        required
        icon={faUser}
        className='mb-8'
      />

      <Input
        name='password'
        placeholder='digite sua senha'
        labelText='Password'
        labelPosition='top'
        type='password'
        required
        icon={faLock}
        className='mt-8'
      />

      <Button
        className='w-full mt-8 tablet-portrait:h-14 tablet-portrait:text-2xl'
        type='submit'
        disabled={isPendding}
      >
        <FontAwesomeIcon
          icon={isPendding ? faSpinner : faRightToBracket}
          spinPulse={isPendding}
          className='h-full mr-4'
        />
        Login
      </Button>
      <span className='text-red-700 w-full py-4 flex items-center justify-center'>
        {ErrorMessage}
      </span>
    </form>
  );
}

