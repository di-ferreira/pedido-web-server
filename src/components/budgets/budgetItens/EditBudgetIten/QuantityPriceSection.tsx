'use client';
import { iProduto } from '@/@types/Produto';
import { Input } from '@/components/ui/input';
import { FormatToCurrency } from '@/lib/utils';

interface iQuantityPriceSection {
  productSelected: iProduto | null;
  QtdItem: string;
  currentPrice: number;
  budgetTotal: number;
  isOferta: boolean;
  inputQTDRef: React.RefObject<HTMLInputElement>;
  inputBtnSalvarRef: React.RefObject<HTMLButtonElement>;
  onQtdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQtdBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const QuantityPriceSection = ({
  productSelected,
  QtdItem,
  currentPrice,
  budgetTotal,
  isOferta,
  inputQTDRef,
  inputBtnSalvarRef,
  onQtdChange,
  onQtdBlur,
}: iQuantityPriceSection) => {
  return (
    <div className={`flex items-end pt-4 gap-x-4`}>
      <div className={`flex w-[10%]`}>
        <Input
          disabled
          value={productSelected ? productSelected.QTDATUAL : 0}
          name='ESTOQUE'
          type='number'
          labelText='ESTOQUE'
          labelPosition='top'
        />
      </div>
      <div className={`flex w-[10%]`}>
        <Input
          onChange={onQtdChange}
          onBlur={onQtdBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              inputBtnSalvarRef.current?.focus();
            }
          }}
          value={QtdItem}
          ref={inputQTDRef}
          name='QTD'
          labelText='QTD'
          labelPosition='top'
          className='text-right'
        />
      </div>
      <div className={`flex w-[20%] relative`}>
        {isOferta && (
          <span
            className={`absolute text-[12px] font-bold text-red-700 top-2 left-12`}
          >
            *Produto em oferta
          </span>
        )}
        <Input
          value={FormatToCurrency(currentPrice.toString())}
          name='VALOR (R$)'
          labelText='VALOR'
          labelPosition='top'
          className='text-right'
          disabled
        />
      </div>
      <div className={`flex w-[20%]`}>
        <Input
          value={FormatToCurrency(budgetTotal.toString())}
          name='TOTAL'
          labelText='TOTAL'
          labelPosition='top'
          className='text-right'
          disabled
        />
      </div>
    </div>
  );
};

export default QuantityPriceSection;
