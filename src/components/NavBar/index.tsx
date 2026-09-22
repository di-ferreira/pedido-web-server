'use client';
import {
  faBoxArchive,
  faFileInvoiceDollar,
  faFileLines,
  faHomeAlt,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useNavStore } from '@/store/useNavStore';
import NavBarItem, { iNavItem } from './NavBarItem';
import UserNameText from '@/components/Header/UserNameText';
import { ThemeToggle } from '@/components/Header/ThemeToggle';
import ButtonSingOut from '@/components/ui/ButtonLogout';

const linkList: iNavItem[] = [
  { icon: faHomeAlt, link: '/app/dashboard', text: 'Dashboard' },
  { icon: faUsers, link: '/app/customers', text: 'Clientes' },
  { icon: faBoxArchive, link: '/app/products', text: 'Produtos' },
  { icon: faFileLines, link: '/app/budgets', text: 'Orçamentos' },
  { icon: faFileInvoiceDollar, link: '/app/pre-sales', text: 'Pré-vendas' },
  { icon: faFileInvoiceDollar, link: '/app/sales', text: 'Vendas' },
];

const NavBar = () => {
  const { isOpen, close } = useNavStore();
  const pathname = usePathname();

  const handleLinkClick = () => {
    close();
  };

  return (
    <>
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 md:hidden'
          onClick={close}
          aria-hidden='true'
        />
      )}
      <nav
        aria-label='Navegação principal'
        className={`fixed md:sticky top-0 left-0 z-50 h-dvh flex flex-col bg-emsoft_blue-main border-r-2 border-emsoft_orange-main transition-transform duration-200 ease-in-out md:transition-all md:duration-150
          ${isOpen ? 'translate-x-0 w-52' : '-translate-x-full md:translate-x-0 md:w-14'}
          md:hover:w-52`}
      >
        <div className='md:hidden px-4 py-3 border-b border-emsoft_blue-light'>
          <Suspense fallback={<span>Carregando...</span>}>
            <UserNameText />
          </Suspense>
        </div>
        <ul className='flex flex-col flex-1 w-full py-2 gap-1 overflow-y-auto'>
          {linkList.map((link, idx) => (
            <NavBarItem
              key={idx}
              icon={link.icon}
              link={link.link}
              text={link.text}
              active={pathname === link.link}
              onNavigate={handleLinkClick}
            />
          ))}
        </ul>
        <div className='md:hidden flex items-center justify-between px-4 py-3 border-t border-emsoft_blue-light'>
          <ThemeToggle />
          <ButtonSingOut />
        </div>
      </nav>
    </>
  );
};

export default NavBar;
