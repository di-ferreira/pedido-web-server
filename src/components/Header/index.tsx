import Image from 'next/image';
import { Suspense } from 'react';
import Logo from '../../../public/logo.png';
import ButtonSingOut from '../ui/ButtonLogout';
import UserNameText from './UserNameText';

const Header = () => {
  return (
    <header className='flex w-full px-6 py-3 items-center justify-between shadow-lg'>
      <Image src={Logo} alt='Logo da Emsoft' />
      <section className='flex px-1'>
        <Suspense fallback={<span>Carregando nome do vendedor...</span>}>
          <UserNameText />
        </Suspense>
        <ButtonSingOut />
      </section>
    </header>
  );
};

export default Header;

