'use client';
import { iCondicaoPgto, iFormaPgto } from '@/@types/PreVenda';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '../ui/select';

interface iPaymentConditionsSection {
  CondicaoPgto: iCondicaoPgto[];
  CondicaoPgtoSelected: iCondicaoPgto;
  FormaPgto: iFormaPgto[];
  FormaPgtoSelected: iFormaPgto | undefined;
  ObsPedido: string;
  onCondicaoChange: (condicao: iCondicaoPgto) => void;
  onFormaChange: (forma: iFormaPgto) => void;
  onObsPedidoChange: (value: string) => void;
}

const PaymentConditionsSection = ({
  CondicaoPgto,
  CondicaoPgtoSelected,
  FormaPgto,
  FormaPgtoSelected,
  ObsPedido,
  onCondicaoChange,
  onFormaChange,
  onObsPedidoChange,
}: iPaymentConditionsSection) => {
  return (
    <div className='flex w-full mt-5 flex-wrap gap-x-3'>
      <div className='flex w-full gap-x-3 items-end tablet:flex-wrap'>
        <div className='w-[17.5%] tablet:w-[20%]'>
          <Input
            name='ID_CONDICAO'
            value={CondicaoPgtoSelected!.ID}
            labelPosition='top'
            className='w-full'
            disabled
          />
        </div>
        <div className='w-[40%] tablet:w-[76%]'>
          <Select
            defaultValue={CondicaoPgtoSelected.NOME}
            value={String(CondicaoPgtoSelected.ID)}
            onValueChange={(e: string) => {
              const selectedCondicao = CondicaoPgto.find(
                (cp) => cp.NOME === e,
              );
              if (selectedCondicao) {
                onCondicaoChange(selectedCondicao);
              }
            }}
          >
            <SelectTrigger className='w-full mb-2 text-emsoft_dark-text'>
              {CondicaoPgtoSelected.NOME}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CondicaoPgto.map((tb) => (
                  <SelectItem
                    key={tb.ID}
                    value={String(tb.NOME)}
                    className='text-emsoft_dark-text'
                  >
                    {tb.NOME}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='w-[40%] tablet:w-[100%]'>
          <Label>Forma de pagamento:</Label>
          <Select
            defaultValue={FormaPgtoSelected?.CARTAO}
            value={String(FormaPgtoSelected?.CARTAO)}
            onValueChange={(e: string) => {
              const selectedForma = FormaPgto.find((cp) => cp.CARTAO === e);
              if (selectedForma) {
                onFormaChange(selectedForma);
              }
            }}
          >
            <SelectTrigger className='w-full mb-2 text-emsoft_dark-text'>
              {FormaPgtoSelected?.CARTAO}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {FormaPgto.map((frmPgto) => (
                  <SelectItem
                    key={frmPgto.CARTAO}
                    value={String(frmPgto.CARTAO)}
                    className='text-emsoft_dark-text'
                  >
                    {frmPgto.CARTAO}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='w-full pr-3 tablet:pr-0'>
        <Input
          onChange={(e) => onObsPedidoChange(e.target.value)}
          labelText='OBS PEDIDO'
          labelPosition='top'
          name='OBS_PEDIDO'
          value={ObsPedido}
          height='3.5rem'
        />
      </div>
    </div>
  );
};

export default PaymentConditionsSection;
