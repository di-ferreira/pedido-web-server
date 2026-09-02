// components/Modal.tsx — COMPONENTE GENÉRICO
'use client';
import { cn } from '@/lib/utils';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useId } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  Title: string;
  children: React.ReactNode;
  OnClose: () => void;
  OnCloseButtonClick?: () => void;
  bodyHeight?: string;
  bodyWidth?: string;
  containerStyle?: string;
  titleStyle?: string;
}

export default function Modal({
  Title,
  children,
  OnClose,
  OnCloseButtonClick,
  bodyHeight,
  bodyWidth,
  containerStyle,
  titleStyle,
}: ModalProps) {
  const modalId = useId();
  const titleId = `modal-title-${modalId}`;

  const OnEscKeyClose = (fn: () => void) => {
    const handleEscKey = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          fn();
        }
      },
      [fn]
    );

    useEffect(() => {
      document.addEventListener('keydown', handleEscKey, false);
      return () => document.removeEventListener('keydown', handleEscKey, false);
    }, [handleEscKey]);
  };

  OnEscKeyClose(OnClose);

  const BtnClose = useCallback(() => {
    OnClose();
    OnCloseButtonClick && OnCloseButtonClick();
  }, []);

  return ReactDOM.createPortal(
    <section
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
      className='flex items-center justify-center fixed top-0 left-0 z-[500] w-full h-dvh bg-emsoft_dark-text bg-opacity-70'
    >
      <div
        className={cn(
          `relative overflow-hidden max-w-full max-h-full flex flex-col w-full items-center gap-1.5 my-2 bg-white rounded-md`,
          containerStyle
        )}
      >
        <button
          type='button'
          aria-label='Fechar modal'
          className='absolute right-0 top-0 flex items-center justify-center cursor-pointer border-none min-w-7 min-h-7 max-w-10 max-h-10 bg-red-700'
          onClick={BtnClose}
        >
          <FontAwesomeIcon
            icon={faTimes}
            size='xl'
            className='text-white'
            aria-hidden='true'
          />
        </button>
        <header
          className={cn(
            `flex items-center justify-center text-3xl uppercase font-bold w-full h-11 border-b-2 border-emsoft_orange-main`,
            titleStyle
          )}
        >
          <h1 id={titleId}>{Title}</h1>
        </header>
        <main
          className={cn(
            `relative p-3 overflow-hidden`,
            bodyHeight ? `h-[${bodyHeight}]` : 'h-full',
            bodyWidth ? `w-[${bodyWidth}]` : 'w-full'
          )}
        >
          {children}
        </main>
      </div>
    </section>,
    document.body
  );
}

