'use client';
import Image from 'next/image';
import { Suspense } from 'react';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LogoBranca from '../../../public/logo-branca.png';
import ButtonSingOut from '../ui/ButtonLogout';
import { ThemeToggle } from './ThemeToggle';
import UserNameText from './UserNameText';
import { useNavStore } from '@/store/useNavStore';

const Header = () => {
  const { toggle } = useNavStore();

  return (
    <header className='flex w-full px-4 md:px-6 py-3 items-center justify-between shadow-lg bg-emsoft_blue-main relative z-50'>
      <div className='flex items-center gap-3 flex-1 md:flex-none'>
        <button
          onClick={toggle}
          className='md:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-emsoft_blue-light transition-colors'
          aria-label='Abrir menu de navegação'
        >
          <FontAwesomeIcon icon={faBars} className='text-emsoft_light-main' size='lg' />
        </button>
        <div className='flex-1 md:flex-none flex justify-center md:justify-start'>
          <Image src={LogoBranca} alt='Logo da Emsoft' className='-ml-[45px] md:ml-0' />
        </div>
      </div>
      <section className='hidden md:flex px-1 items-center gap-2'>
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
