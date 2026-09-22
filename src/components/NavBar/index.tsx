'use client';
import {
  faBoxArchive,
  faFileInvoiceDollar,
  faFileLines,
  faHomeAlt,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { usePathname } from 'next/navigation';
import { useNavStore } from '@/store/useNavStore';
import NavBarItem, { iNavItem } from './NavBarItem';

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
        className={`fixed md:sticky top-0 left-0 z-50 h-dvh bg-emsoft_blue-main border-r-2 border-emsoft_orange-main transition-transform duration-200 ease-in-out md:transition-all md:duration-150
          ${isOpen ? 'translate-x-0 w-52' : '-translate-x-full md:translate-x-0 md:w-14'}
          md:hover:w-52`}
      >
        <ul className='flex flex-col w-full h-full py-2 gap-1'>
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
      </nav>
    </>
  );
};

export default NavBar;
