import { faTimes } from '@fortawesome/free-solid-svg-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { iModal, iModalRender } from '../../@types/Modal';
import { cn } from '@/lib/utils';

const RenderLayout: React.FC<iModalRender> = ({
  Title,
  OnClose,
  OnCloseButtonClick,
  children,
  bodyHeight,
  bodyWidth,
  containerStyle,
}) => {
  const BtnClose = () => {
    OnClose();
    OnCloseButtonClick && OnCloseButtonClick();
  };

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

  return (
    <section className='flex items-center justify-center fixed top-0 left-0 z-[500] w-screen h-screen bg-emsoft_dark-text bg-opacity-70'>
      <div
        className={cn(
          `relative overflow-hidden max-w-full max-h-full flex flex-col w-full items-center gap-1.5 my-2 bg-white rounded-md`,
          containerStyle
        )}
      >
        <span
          className='absolute right-0 top-0 flex items-center justify-center cursor-pointer border-none w-10 h-10 bg-red-700'
          onClick={BtnClose}
        >
          <FontAwesomeIcon
            icon={faTimes}
            size='xl'
            title='Fechar'
            className='text-white'
          />
        </span>
        <header
          className={`flex items-center justify-center text-3xl uppercase font-bold w-full h-11 border-b-2 border-emsoft_orange-main`}
        >
          <h1>{Title}</h1>
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
    </section>
  );
};

const useModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  const OnClose = () => setIsVisible(false);
  const Modal: React.FC<iModal> = ({
    Title,
    children,
    OnCloseButtonClick,
    bodyHeight,
    bodyWidth,
    containerStyle,
  }) =>
    ReactDOM.createPortal(
      RenderLayout({
        Title,
        children,
        OnClose,
        OnCloseButtonClick,
        bodyHeight,
        bodyWidth,
        containerStyle,
      }),
      document.body
    );

  const ResultModal = useMemo(() => {
    return isVisible ? Modal : null;
  }, [isVisible]);

  const ShowModal = useCallback(() => setIsVisible(true), [isVisible]);

  return {
    Modal: ResultModal,
    showModal: () => ShowModal(),
    OnCloseModal: OnClose,
  };
};

export default useModal;
