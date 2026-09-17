'use client';
import {
  faBoxArchive,
  faFileInvoiceDollar,
  faFileLines,
  faHomeAlt,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import NavBarItem, { iNavItem } from './NavBarItem';

const NavBar = () => {
  const [open, setOpen] = useState<boolean>(false);

  const linkList: iNavItem[] = [
    { icon: faHomeAlt, link: '/app/dashboard', text: 'Dashboard' },
    { icon: faUsers, link: '/app/customers', text: 'Clientes' },
    { icon: faBoxArchive, link: '/app/products', text: 'Produtos' },
    { icon: faFileLines, link: '/app/budgets', text: 'Orçamentos' },
    { icon: faFileInvoiceDollar, link: '/app/pre-sales', text: 'Pré-vendas' },
    { icon: faFileInvoiceDollar, link: '/app/sales', text: 'Vendas' },
    // { icon: faCogs, link: '/app/config', text: 'Configuração' },
  ];

  return (
    <nav
      aria-label='Navegação principal'
      className={`flex transition-all overflow-hidden 
                  ${open ? 'w-52' : 'w-14'} 
                  h-dvh  
                  bg-emsoft_blue-main
                  border-t-0 border-r-2 border-emsoft_orange-main
                  md:w-14 md:hover:w-52`}
      onClick={() => setOpen((curr) => !curr)}
    >
      <ul className='flex flex-col w-full h-full'>
        {linkList.map((link, idx) => (
          <NavBarItem
            key={idx}
            icon={link.icon}
            link={link.link}
            text={link.text}
          />
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;

