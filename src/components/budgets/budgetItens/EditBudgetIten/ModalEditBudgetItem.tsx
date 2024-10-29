'use client';
import { Button } from '@/components/ui/button';
import useModal from '@/hooks/useModal';
import { cn } from '@/lib/utils';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface iModalEditBudgetItem {
  children: React.ReactNode;
  modalTitle: string;
  buttonText?: string;
  buttonIcon?: IconProp;
  buttonStyle?: string | undefined;
  iconStyle?: string | undefined;
}

export const ModalEditBudgetItem: React.FC<iModalEditBudgetItem> = ({
  children,
  buttonText,
  buttonIcon,
  modalTitle,
  buttonStyle,
  iconStyle,
}) => {
  const { Modal, OnCloseModal, showModal } = useModal();
  return (
    <>
      <Button className={cn(`gap-2`, buttonStyle)} onClick={() => showModal()}>
        {buttonIcon && (
          <FontAwesomeIcon
            icon={buttonIcon}
            className={cn('text-emsoft_light-main', iconStyle)}
            size='xl'
            title={buttonText}
          />
        )}
        {buttonText}
      </Button>
      {Modal && (
        <Modal Title={modalTitle} containerStyle='w-[80%] h-[95%]'>
          {children}
        </Modal>
      )}
    </>
  );
};

