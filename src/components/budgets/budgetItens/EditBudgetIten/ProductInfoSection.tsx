'use client';
import { iProduto } from '@/@types/Produto';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface iProductInfoSection {
  productSelected: iProduto | null;
  WordProducts: string;
  inputProductRef: React.RefObject<HTMLInputElement>;
  isEditing: boolean;
  onWordChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const ProductInfoSection = ({
  productSelected,
  WordProducts,
  inputProductRef,
  isEditing,
  onWordChange,
  onSearchKeyDown,
}: iProductInfoSection) => {
  return (
    <div className={`flex w-[70%] flex-col gap-y-3 tablet:w-[60%]`}>
      <div className={`flex gap-x-3 px-3 tablet:flex-wrap`}>
        <div
          className={`flex w-[30%] gap-x-1 items-end tablet:w-[50%] tablet-portrait:w-[100%]`}
        >
          <div className={`flex w-[100%]`}>
            <Input
              onChange={(e) => onWordChange(e.target.value.toUpperCase())}
              value={WordProducts}
              ref={inputProductRef}
              name='ProdutoPalavras'
              labelText='PRODUTO'
              labelPosition='top'
              enterKeyHint='enter'
              onKeyDown={onSearchKeyDown}
              disabled={isEditing}
            />
          </div>
        </div>
        <div
          className={`flex w-[25%] tablet:w-[47%] tablet-portrait:w-[100%]`}
        >
          <Input
            disabled
            value={productSelected ? productSelected.REFERENCIA : ''}
            name='REFERÊNCIA'
            labelText='REFERÊNCIA'
            labelPosition='top'
          />
        </div>
        <div
          className={`flex w-[30%] tablet:w-[70%] tablet-portrait:w-[100%]`}
        >
          <Input
            disabled
            value={productSelected ? productSelected.FABRICANTE?.NOME : ''}
            name='FABRICANTE'
            labelText='FABRICANTE'
            labelPosition='top'
          />
        </div>
        <div
          className={`flex w-[15%] tablet:w-[27%] tablet-portrait:w-[100%]`}
        >
          <Input
            disabled
            value={
              productSelected
                ? productSelected.LOCAL?.toLocaleUpperCase()
                : ''
            }
            name='LOCALIZAÇÃO'
            labelText='LOCALIZAÇÃO'
            labelPosition='top'
          />
        </div>
      </div>
      <div className={`flex flex-col gap-y-3 px-3`}>
        <div className={`flex grow`}>
          <Input
            disabled
            value={productSelected ? productSelected.NOME : ''}
            name='NOME DO PRODUTO'
            labelText='NOME DO PRODUTO'
            labelPosition='top'
          />
        </div>
        <div>
          <Textarea
            rows={6}
            labelText='APLICAÇÃO PRODUTO'
            labelPosition='top'
            disabled
            name='APLICACAO'
            className='resize-none'
            value={productSelected ? productSelected.APLICACOES : ''}
          />
        </div>
        <div>
          <Textarea
            rows={6}
            labelPosition='top'
            labelText='INFORMACOES'
            disabled
            name='INFORMACOES.PRODUTO'
            className='resize-none'
            value={
              productSelected
                ? productSelected.INSTRUCOES?.toString()
                : ''
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ProductInfoSection;
