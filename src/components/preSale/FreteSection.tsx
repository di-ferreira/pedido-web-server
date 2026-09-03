'use client';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '../ui/select';

type iFrete = 'ENTREGA' | 'RETIRADA';
interface iTipoEntrega {
  id: iFrete;
  value: iFrete;
}

interface iFreteSection {
  TipoEntrega: iTipoEntrega[];
  TipoEntregaSelected: iTipoEntrega;
  ObsNotaFiscal: string;
  onTipoEntregaChange: (entrega: iTipoEntrega) => void;
  onObsNotaFiscalChange: (value: string) => void;
}

const FreteSection = ({
  TipoEntrega,
  TipoEntregaSelected,
  ObsNotaFiscal,
  onTipoEntregaChange,
  onObsNotaFiscalChange,
}: iFreteSection) => {
  return (
    <>
      <div className={`flex w-full mt-5 flex-wrap`}>
        <div className='w-full'>
          <h4>FRETE</h4>
        </div>
        <div className='w-full flex flex-col items-start gap-x-3'>
          <div className='w-[40%] tablet:w-full'>
            <Select
              defaultValue={TipoEntregaSelected.value}
              value={String(TipoEntregaSelected.value)}
              onValueChange={(e: string) => {
                const entrega = TipoEntrega.find((cp) => cp.value === e);
                if (entrega) {
                  onTipoEntregaChange(entrega);
                }
              }}
            >
              <SelectTrigger className='w-full mb-2 text-emsoft_dark-text'>
                {TipoEntregaSelected.value}
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TipoEntrega.map((tranp, idx) => (
                    <SelectItem
                      key={idx}
                      value={String(tranp.value)}
                      className='text-emsoft_dark-text'
                    >
                      {tranp.value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className='flex w-full mt-5 my-4'>
        <Input
          onChange={(e) => onObsNotaFiscalChange(e.target.value)}
          labelText='OBS NOTA FISCAL'
          labelPosition='top'
          name='OBS_NF'
          value={ObsNotaFiscal}
          height='3.5rem'
        />
      </div>
    </>
  );
};

export default FreteSection;
