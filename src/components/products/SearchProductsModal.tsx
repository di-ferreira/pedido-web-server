'use client';
import useModal from '@/hooks/useModal';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import React, { useEffect } from 'react';

interface iModalSearchProduct {
  children: React.ReactElement<{ onCloseModal?: () => void }>; // Adicione esta tipagem
  IsVisible: Boolean;
  modalTitle: string;
  buttonText?: string;
  buttonIcon?: IconProp;
  buttonStyle?: string | undefined;
  iconStyle?: string | undefined;
  titleButton?: string | undefined;
}

export const SearchProductsModal = ({
  children,
  buttonText,
  buttonIcon,
  modalTitle,
  buttonStyle,
  IsVisible,
  iconStyle,
  titleButton = '',
}: iModalSearchProduct) => {
  const { Modal, OnCloseModal, showModal } = useModal();

  useEffect(() => {
    if (IsVisible) {
      showModal();
    } else {
      OnCloseModal();
    }
  }, [IsVisible]);
  return (
    <>
      {Modal && (
        <Modal
          Title={modalTitle}
          // containerStyle='laptop:w-screen w-full laptop:h-screen tablet-a8-portrait:w-screen tablet-a8-portrait:h-screen bg-gray-200'
          containerStyle='laptop:w-[75%] laptop:h-[80%]'
        >
          {React.cloneElement(children, { onCloseModal: OnCloseModal })}
        </Modal>
      )}
    </>
  );
};

