'use client';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface iNavItem {
  icon: IconProp;
  text: string;
  link: string;
}

interface iNavBarItemProps extends iNavItem {
  active?: boolean;
  onNavigate?: () => void;
}

const NavBarItem = ({ icon, link, text, active, onNavigate }: iNavBarItemProps) => {
  return (
    <li className='w-full'>
      <Link
        href={link}
        onClick={onNavigate}
        title={text}
        className={cn(
          'flex items-center gap-5 min-h-[44px] px-3 py-2 rounded-md transition-colors overflow-hidden',
          active
            ? 'bg-emsoft_blue-light text-emsoft_light-main'
            : 'text-emsoft_light-main hover:bg-emsoft_blue-light'
        )}
      >
        <span className='flex items-center justify-center w-6 shrink-0'>
          <FontAwesomeIcon icon={icon} className='text-[1.333em] md:text-[1.65em]' />
        </span>
        <span className='text-sm font-medium whitespace-nowrap'>
          {text}
        </span>
      </Link>
    </li>
  );
};

export default NavBarItem;
