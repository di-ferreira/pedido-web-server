import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React from 'react';

export interface iNavItem {
  icon: IconProp;
  text: string;
  link: string;
}

const NavBarItem: React.FC<iNavItem> = ({ icon, link, text }) => {
  return (
    <li
      className='gap-3 my-1 transition-all hover:bg-emsoft_blue-light'
      title={text}
    >
      <Link
        href={link}
        className='flex items-baseline text-emsoft_light-main  p-3'
      >
        <span
          className={
            'flex items-center justify-center  w-5 h-auto pr-1 ml-1 mr-[18px]'
          }
        >
          <FontAwesomeIcon
            icon={icon}
            className='text-emsoft_light-main'
            size='xl'
          />
        </span>
        {text}
      </Link>
    </li>
  );
};

export default NavBarItem;

