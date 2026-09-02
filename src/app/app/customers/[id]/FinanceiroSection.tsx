'use client';
import { iCredito } from '@/@types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dayjs from 'dayjs';

interface iFinanceiroSection {
  LimiteCredito: number;
  ContasAtrazadas: number;
  ContasAVencer: number;
  ContasAbertas: number;
  TotalCreditos: number;
  SaldoCompra: number;
  ListaDebitos: iCredito[];
  ListaDebitosNaoVencidos: iCredito[];
  ListaCreditos: iCredito[];
}

const FinanceiroSection = ({
  LimiteCredito,
  ContasAtrazadas,
  ContasAVencer,
  ContasAbertas,
  TotalCreditos,
  SaldoCompra,
  ListaDebitos,
  ListaDebitosNaoVencidos,
  ListaCreditos,
}: iFinanceiroSection) => {
  function parseCurrency(currency: number) {
    return currency.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return (
    <div className='flex gap-4 w-full h-[300px] overflow-x-hidden overflow-y-auto px-5 py-0 flex-wrap'>
      <Tabs defaultValue='resumo' className='w-full'>
        <TabsList>
          <TabsTrigger value='resumo'>Resumo</TabsTrigger>
          <TabsTrigger value='creditos'>Créditos</TabsTrigger>
          <TabsTrigger value='vencidos'>Vencidos</TabsTrigger>
          <TabsTrigger value='nao_vencidos'>Não Vencidos</TabsTrigger>
        </TabsList>
        <TabsContent value='resumo'>
          <section className='w-full h-full flex flex-col'>
            <header className='flex w-[40%] px-3 justify-between border border-b-slate-800'>
              <span className='font-bold'>Descrição</span>
              <span className='font-bold'>Valor</span>
            </header>
            <article className='flex w-[40%] px-3 justify-between border border-b-slate-400'>
              <p>Limite de crédito</p>
              <p>
                {LimiteCredito.toLocaleString('pt-br', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            </article>
            <article className='flex w-[40%] px-3 justify-between border border-b-slate-400'>
              <p>Contas não vencidas</p>
              <p>{parseCurrency(ContasAVencer)}</p>
            </article>
            <article className='flex w-[40%] px-3 justify-between border border-b-slate-400'>
              <p>Contas vencidas</p>
              <p>{parseCurrency(ContasAtrazadas)}</p>
            </article>
            <article className='flex w-[40%] px-3 justify-between border border-b-slate-400'>
              <p>Total de Contas a receber</p>
              <p>{parseCurrency(ContasAbertas)}</p>
            </article>
            <article className='flex w-[40%] px-3 justify-between border border-b-slate-400'>
              <p>Créditos</p>
              <p>{parseCurrency(TotalCreditos)}</p>
            </article>
            <article className='flex w-[40%] px-3 justify-between border border-b-slate-400'>
              <p>Saldo para comprar</p>
              <p>{parseCurrency(SaldoCompra)}</p>
            </article>
          </section>
        </TabsContent>
        <TabsContent value='creditos'>
          <Table className='w-[40%]'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[150px]'>VENCIMENTO</TableHead>
                <TableHead>DOC</TableHead>
                <TableHead>HISTÓRICO</TableHead>
                <TableHead className='text-right'>A PAGAR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ListaCreditos && ListaCreditos.length <= 0 ? (
                <span>Não há Créditos</span>
              ) : (
                ListaCreditos.map((lc, idx) => (
                  <TableRow key={idx}>
                    <TableCell className='font-medium'>
                      {dayjs(lc.VENCIMENTO).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>{lc.DOC}</TableCell>
                    <TableCell>{lc.HISTORICO}</TableCell>
                    <TableCell className='text-right'>
                      {parseCurrency(lc.RESTA)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value='vencidos'>
          <Table className='w-[40%]'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[150px]'>VENCIMENTO</TableHead>
                <TableHead>DOC</TableHead>
                <TableHead>HISTÓRICO</TableHead>
                <TableHead className='text-right'>A PAGAR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ListaDebitos.length <= 0 ? (
                <span>Não há pagamentos vencidos</span>
              ) : (
                ListaDebitos.map((lc, idx) => (
                  <TableRow key={idx}>
                    <TableCell className='font-medium'>
                      {dayjs(lc.VENCIMENTO).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>{lc.DOC}</TableCell>
                    <TableCell>{lc.HISTORICO}</TableCell>
                    <TableCell className='text-right'>
                      {parseCurrency(lc.RESTA)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value='nao_vencidos'>
          <Table className='w-[40%]'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[150px]'>VENCIMENTO</TableHead>
                <TableHead>DOC</TableHead>
                <TableHead>HISTÓRICO</TableHead>
                <TableHead className='text-right'>A PAGAR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ListaDebitosNaoVencidos.length <= 0 ? (
                <span>Não há pagamentos não vencidos</span>
              ) : (
                ListaDebitosNaoVencidos.map((lc, idx) => (
                  <TableRow key={idx}>
                    <TableCell className='font-medium'>
                      {dayjs(lc.VENCIMENTO).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>{lc.DOC}</TableCell>
                    <TableCell>{lc.HISTORICO}</TableCell>
                    <TableCell className='text-right'>
                      {parseCurrency(lc.RESTA)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceiroSection;
