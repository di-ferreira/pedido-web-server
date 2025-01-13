'use client';
import {
  faFileInvoiceDollar,
  faFileLines,
  faHomeAlt,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import NavBarItem, { iNavItem } from './NavBarItem';

const NavBar = () => {
  const [open, setOpen] = useState<boolean>(true);

  const linkList: iNavItem[] = [
    { icon: faHomeAlt, link: '/app/dashboard', text: 'Dashboard' },
    { icon: faUsers, link: '/app/customers', text: 'Clientes' },
    { icon: faFileLines, link: '/app/budgets', text: 'Orçamentos' },
    { icon: faFileInvoiceDollar, link: '/app/pre-sales', text: 'Pré-vendas' },
    { icon: faFileInvoiceDollar, link: '/app/sales', text: 'Vendas' },
    // { icon: faCogs, link: '/app/config', text: 'Configuração' },
  ];

  return (
    <aside
      className={`flex transition-all overflow-hidden 
                  ${open ? ' w-52 ' : ' w-14  '} 
                  h-screen  
                  bg-emsoft_blue-main
                  border-t-0 border-r-2 border-emsoft_orange-main
                  md:w-14 md:hover:w-52`}
      onMouseOver={() => setOpen((curr) => true)}
      onMouseOut={() => setOpen((curr) => false)}
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
    </aside>
  );
};

export default NavBar;

