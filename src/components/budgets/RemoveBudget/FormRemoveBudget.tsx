'use client';
import { iOrcamento } from '@/@types/Orcamento';
import { RemoverOrcamento } from '@/app/actions/orcamento';
import { getErrorMessage } from '@/lib/utils';
import { Loading } from '@/components/Loading';
import ToastNotify from '@/components/ToastNotify';
import { Button } from '@/components/ui/button';
import { faBan, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

interface iRemoveBudget {
  params: iOrcamento;
  onCloseModal?: () => void;
  onSuccess?: () => void;
}

const RemoveBudget = ({ params, onCloseModal, onSuccess }: iRemoveBudget) => {
  const [loading, setLoading] = useState(false);
  async function ExcluirOrcamento(orc: iOrcamento) {
    setLoading(true);
    try {
      const res = await RemoverOrcamento(orc);
      if (res.error) throw res.error;

      onSuccess?.();
      ToastNotify({ message: `Sucesso: Orçamento removido!`, type: 'success' });
    } catch (e) {
      // 👇 Reverte a remoção se der erro
      //   refreshTable?.();
      ToastNotify({ message: `Erro: ${getErrorMessage(e)}`, type: 'error' });
    } finally {
      onCloseModal?.();
      setLoading(false);
    }
  }

  return (
    <div className='flex flex-col items-center'>
      {loading ? (
        <Loading />
      ) : (
        <>
          <h1 className='mt-[-12px] mb-4'>
            Deseja Excluir Orçamento <b>{params.ORCAMENTO}</b>?
          </h1>
          <div className='w-full h-full flex justify-center items-center gap-6'>
            <Button
              className='bg-emsoft_success-main hover:bg-emsoft_success-light'
              onClick={() => ExcluirOrcamento(params)}
              title='SIM'
            >
              <FontAwesomeIcon
                icon={faCheck}
                className='text-emsoft_light-main mr-3'
                size='xl'
                title={'Check Yes'}
              />
              SIM
            </Button>
            <Button
              className='bg-emsoft_danger-main hover:bg-emsoft_danger-light'
              onClick={() => onCloseModal && onCloseModal()}
              title='NÃO'
            >
              <FontAwesomeIcon
                icon={faBan}
                className='text-emsoft_light-main mr-3'
                size='xl'
                title={'Check No'}
              />
              NÃO
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default RemoveBudget;

