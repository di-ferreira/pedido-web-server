import Image from 'next/image';
import { Suspense } from 'react';
import LogoBranca from '../../../public/logo-branca.png';
import ButtonSingOut from '../ui/ButtonLogout';
import { ThemeToggle } from './ThemeToggle';
import UserNameText from './UserNameText';

const Header = () => {
  return (
    <header className='flex w-full px-6 py-3 items-center justify-between shadow-lg bg-emsoft_blue-main'>
      <Image src={LogoBranca} alt='Logo da Emsoft' />
      <section className='flex px-1 items-center gap-2'>
        <Suspense fallback={<span>Carregando nome do vendedor...</span>}>
          <UserNameText />
        </Suspense>
        <ThemeToggle />
        <ButtonSingOut />
      </section>
    </header>
  );
};

export default Header;

