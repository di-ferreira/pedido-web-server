'use client';
import { ResponseType } from '@/@types';
import { iCliente } from '@/@types/Cliente';
import { iItensOrcamento, iOrcamento } from '@/@types/Orcamento';
import { iListaSimilare, iProduto } from '@/@types/Produto';
import { iColumnType, iDataResultTable } from '@/@types/Table';
import { addItem, GetOrcamento, updateItem } from '@/app/actions/orcamento';
import {
  GetNewPriceFromTable,
  GetProduct,
  SuperFindProducts,
} from '@/app/actions/produto';
import { DataTable } from '@/components/CustomDataTable';
import SuperSearchProducts from '@/components/products/SuperSearchProduct';
import ToastNotify from '@/components/ToastNotify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import useModal from '@/hooks/useModal';
import { FormatToCurrency } from '@/lib/utils';
import { faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { tableChavesHeaders } from './columns';

interface iFormEditItem {
  item?: iItensOrcamento;
  budgetCode: number;
  CallBack?: () => void;
}

const FormEdit = ({ item, budgetCode, CallBack }: iFormEditItem) => {
  const { Modal, OnCloseModal, showModal } = useModal();
  const [budgetItem, setBudgetItem] = useState<iItensOrcamento>({
    QTD: 1,
    VALOR: 0,
    TOTAL: 0,
    SUBTOTAL: 0,
    DESCONTO: 0,
    TABELA: 'SISTEMA',
    OBS: '',
    MD5: '',
    ITEM: 0,
    PRECO_LIQUIDO: '',
    IMP_SEPARACAO: '',
    GORDURA: 0,
    P_DESC: 0,
    ID_VALE_CASCO: 0,
    ORCAMENTO: 0,
    PRODUTO: {} as iProduto,
  });
  const [Budget, setBudget] = useState<iOrcamento>({} as iOrcamento);
  const [productSelected, setProductSelected] = useState<iProduto>(
    {} as iProduto
  );
  const [Similares, setSimilares] = useState<iListaSimilare[]>([]);
  let [SerachedProducts, setSerachedProducts] = useState<
    iDataResultTable<iProduto>
  >({
    Qtd_Registros: 0,
    value: [],
  });
  const [WordProducts, setWordProducts] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputProductRef = useRef<HTMLInputElement>(null);
  const inputQTDRef = useRef<HTMLInputElement>(null);
  const inputBtnSalvarRef = useRef<HTMLButtonElement>(null);

  async function saveItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let response;
    let message = '';

    if (budgetItem.ORCAMENTO > 0) {
      response = await updateItem({
        pIdOrcamento: budgetCode,
        pItemOrcamento: {
          CodigoProduto: WordProducts,
          Desconto: 0,
          Frete: 0,
          Qtd: budgetItem.QTD,
          Tabela: budgetItem.TABELA,
          Valor: budgetItem.VALOR,
          SubTotal: budgetItem.SUBTOTAL,
          Total: budgetItem.TOTAL,
        },
      });
      message = 'Item editado com sucesso';
    } else {
      response = await addItem({
        pIdOrcamento: budgetCode,
        pItemOrcamento: {
          CodigoProduto: WordProducts,
          Desconto: 0,
          Frete: 0,
          Qtd: budgetItem.QTD,
          Tabela: budgetItem.TABELA,
          Valor: budgetItem.VALOR,
          SubTotal: budgetItem.SUBTOTAL,
          Total: budgetItem.TOTAL,
        },
      });
      message = 'Item adicionado com sucesso';
    }

    if (response.value !== undefined) {
      ToastNotify({
        message: message,
        type: 'success',
      });
    }

    if (response.error !== undefined) {
      ToastNotify({
        message: 'Erro ao adicionar item',
        type: 'error',
      });
    }

    if (CallBack) CallBack();
  }

  async function loadingProduct(product: iProduto) {
    const prod = await GetProduct(product.PRODUTO);
    const new_price = await GetNewPriceFromTable(
      product,
      Budget.CLIENTE.Tabela
    );

    if (prod.value !== undefined) {
      setBudgetItem(
        (old) =>
          (old = {
            ...budgetItem,
            PRODUTO: prod.value,
            VALOR: new_price.value!,
            QTD: handleCalcQTD(budgetItem.QTD, prod.value),
            SUBTOTAL: new_price.value! * budgetItem.QTD,
            TOTAL: new_price.value! * budgetItem.QTD,
          })
      );
      setProductSelected(prod.value);
      setSimilares((old) => [...prod.value.ListaSimilares]);
      setWordProducts(prod.value.PRODUTO);

      OnCloseModal();
      inputQTDRef.current?.focus();
    }
  }

  async function findProduct() {
    setLoading(true);
    const resultProduct = await GetProduct(WordProducts);

    if (
      resultProduct.value !== undefined &&
      resultProduct.value?.ATIVO !== 'N' &&
      resultProduct.value?.VENDA !== 'N'
    ) {
      const new_price = await GetNewPriceFromTable(
        resultProduct.value,
        Budget.CLIENTE.Tabela
      );

      console.log('new price', new_price);

      setBudgetItem(
        (old) =>
          (old = {
            ...budgetItem,
            PRODUTO: resultProduct.value,
            VALOR: new_price.value!,
            QTD: handleCalcQTD(budgetItem.QTD, resultProduct.value),
            SUBTOTAL: new_price.value! * budgetItem.QTD,
            TOTAL: new_price.value! * budgetItem.QTD,
          })
      );
      setProductSelected(resultProduct.value);
      setSimilares((old) => [...resultProduct.value.ListaSimilares]);
      setWordProducts(resultProduct.value.PRODUTO);

      inputQTDRef.current?.focus();
      setLoading(false);
    }

    if (
      resultProduct.error !== undefined ||
      (resultProduct.value?.ATIVO !== 'S' && resultProduct.value?.VENDA !== 'S')
    ) {
      SuperFindProducts({
        filter: [{ key: 'PRODUTO', value: WordProducts }],
      })
        .then(async (products: ResponseType<iDataResultTable<iProduto>>) => {
          if (products.value !== undefined) {
            if (products.value.Qtd_Registros === 1) {
              loadingProduct(products.value.value[0]);
            } else {
              setSerachedProducts((old) => (old = products.value!));
              showModal();
            }
          }

          if (products.error !== undefined) {
            toast({
              title: 'Error!',
              description: `Erro: ${products.error.message}`,
              variant: 'destructive',
            });
          }
        })
        .catch((e) => {
          toast({
            title: 'Error!',
            description: `Erro: ${e.message}`,
            variant: 'destructive',
          });
        })
        .finally(() => {
          inputQTDRef.current?.focus();
          setLoading(false);
        });
    }
  }

  const OnSearchProduto = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      findProduct();
    }
  };

  const handleCalcQTD = (qtd: number, product: iProduto): number => {
    let newQtd = 1;
    let multiplo = product.MULTIPLO_COMPRA;

    if (product.QTD_VENDA > 1) multiplo = product.QTD_VENDA;

    newQtd = Math.ceil(qtd / multiplo) * multiplo;
    return newQtd;
  };

  async function onChangeQTD(e: React.ChangeEvent<HTMLInputElement>) {
    let newQtd = Number(e.target.value);
    if (isNaN(newQtd)) newQtd = 1;

    const new_price = await GetNewPriceFromTable(
      productSelected,
      Budget.CLIENTE.Tabela
    );

    setBudgetItem((prevBudgetItem) => ({
      ...prevBudgetItem,
      QTD: handleCalcQTD(newQtd, productSelected),
      SUBTOTAL: new_price.value! * newQtd,
      TOTAL: new_price.value! * newQtd,
    }));
  }
  async function LoadItem(cliente: iCliente) {
    if (item) {
      const new_price = await GetNewPriceFromTable(
        item.PRODUTO,
        cliente.Tabela
      );
      setProductSelected(
        (old) =>
          (old = {
            ...item.PRODUTO,
          })
      );

      setBudgetItem(
        (old) =>
          (old = {
            ...item,
            PRODUTO: item.PRODUTO,
            VALOR: new_price.value!,
            QTD: item.QTD,
            SUBTOTAL: item.SUBTOTAL,
            TOTAL: item.TOTAL,
          })
      );
      setWordProducts(item.PRODUTO.PRODUTO);
    }
  }
  useEffect(() => {
    return () => {
      inputProductRef.current?.focus();

      GetOrcamento(budgetCode)
        .then((res) => {
          if (res.value !== undefined) {
            setBudget(res.value!);
            LoadItem(res.value!.CLIENTE);
          }
        })
        .catch((err) => {
          console.error('Erro ao carregar orcamento:', err);
          toast({
            title: 'Error!',
            description: err.message,
            variant: 'destructive',
          });
        });
    };
  }, []);

  const tableSimilaresHeaders: iColumnType<iListaSimilare>[] = [
    {
      key: 'acoes',
      title: 'AÇÕES',
      width: '10%',
      render: (_, item) => (
        <span className='flex w-full items-center justify-center gap-x-5'>
          <FontAwesomeIcon
            icon={faPlus}
            className='cursor-pointer text-emsoft_orange-main hover:text-emsoft_orange-light'
            size='xl'
            title='Adicionar'
            onClick={() => {
              loadingProduct(item.EXTERNO);
            }}
          />
        </span>
      ),
    },
    {
      key: 'EXTERNO.PRODUTO',
      title: 'PRODUTO',
      width: '10%',
    },
    {
      key: 'EXTERNO.NOME',
      title: 'NOME',
      width: '15%',
    },
    {
      key: 'EXTERNO.REFERENCIA',
      title: 'REFERÊNCIA',
      width: '15%',
    },
    {
      key: 'EXTERNO.EQUIVALENTE',
      title: 'EQUIVALENTE',
      width: '15%',
      isHideMobile: true,
    },
    {
      key: 'EXTERNO.DATA_ATUALIZACAO',
      title: 'DATA ATUALIZAÇÃO',
      width: '15%',
      isHideMobile: true,
      render: (_, item) => {
        return dayjs(item.EXTERNO.DATA_ATUALIZACAO).format('DD/MM/YYYY');
      },
    },
    {
      key: 'EXTERNO.QTDATUAL',
      title: 'QTD ATUAL',
      width: '15%',
    },
  ];

  return (
    <form
      ref={formRef}
      onSubmit={saveItem}
      method='POST'
      className={`flex flex-col overflow-x-hidden overflow-y-auto gap-y-3 w-full
                                                            h-full py-0 px-2 `}
    >
      <div
        className={`flex w-full h-[60vh] gap-3 overflow-x-hidden overflow-y-auto`}
      >
        <div className={`flex w-[70%] flex-col gap-y-3 tablet:w-[60%]`}>
          <div className={`flex gap-x-3 px-3  tablet:flex-wrap`}>
            <div
              className={`flex w-[30%] gap-x-1 items-end tablet:w-[50%] tablet-portrait:w-[100%]`}
            >
              <div className={`flex w-[100%]`}>
                <Input
                  onChange={(e) =>
                    setWordProducts(e.target.value.toUpperCase())
                  }
                  value={WordProducts}
                  ref={inputProductRef}
                  name='ProdutoPalavras'
                  labelText='PRODUTO'
                  labelPosition='top'
                  onKeyDown={OnSearchProduto}
                  disabled={item !== undefined}
                />
              </div>
              {/* <div className={`flex w-[10%] mb-2`}>
                <Button
                  type='button'
                  onClick={() => {
                    findProduct();
                  }}
                  className={`flex w-9 h-10`}
                  title='Buscar Produto'
                  disabled={item !== undefined || loading}
                >
                  <FontAwesomeIcon
                    icon={loading ? faSpinner : faSearch}
                    spin={loading}
                    size='xl'
                    title='Fechar'
                    className='text-white'
                  />
                </Button>
              </div> */}
            </div>
            <div
              className={`flex w-[25%] tablet:w-[47%] tablet-portrait:w-[100%]`}
            >
              <Input
                disabled
                value={budgetItem.PRODUTO?.REFERENCIA}
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
                value={budgetItem.PRODUTO?.FABRICANTE?.NOME}
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
                value={budgetItem.PRODUTO?.LOCAL?.toLocaleUpperCase()}
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
                value={budgetItem.PRODUTO?.NOME}
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
                value={budgetItem.PRODUTO?.APLICACOES}
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
                value={budgetItem.PRODUTO?.INSTRUCOES?.toString()}
              />
            </div>
          </div>
        </div>
        <div className={`flex flex-col w-[30%] tablet:w-[40%]`}>
          <DataTable
            columns={tableChavesHeaders}
            IsLoading={false}
            TableData={budgetItem.PRODUTO.ListaChaves}
            ErrorMessage='Nenhuma Chave encontrada'
          />
        </div>
      </div>
      <div className={`flex items-end pt-4 gap-x-4`}>
        <div className={`flex w-[10%]`}>
          <Input
            disabled
            value={budgetItem.PRODUTO?.QTDATUAL}
            name='ESTOQUE'
            type='number'
            labelText='ESTOQUE'
            labelPosition='top'
          />
        </div>
        <div className={`flex w-[10%]`}>
          <Input
            onChange={(e) => {
              let newQtd = Number(e.target.value);

              setBudgetItem((prevBudgetItem) => ({
                ...prevBudgetItem,
                QTD: newQtd,
              }));
            }}
            onBlur={onChangeQTD}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                inputBtnSalvarRef.current?.focus();
              }
            }}
            value={budgetItem.QTD}
            ref={inputQTDRef}
            name='QTD'
            type='number'
            labelText='QTD'
            labelPosition='top'
            className='text-right'
          />
        </div>

        <div className={`flex w-[20%]`}>
          <Input
            value={FormatToCurrency(budgetItem.VALOR.toString())}
            name='VALOR (R$)'
            labelText='VALOR'
            labelPosition='top'
            className='text-right'
            disabled
          />
        </div>
        <div className={`flex w-[20%]`}>
          <Input
            value={FormatToCurrency(budgetItem.TOTAL.toString())}
            name='TOTAL'
            labelText='TOTAL'
            labelPosition='top'
            className='text-right'
            disabled
          />
        </div>
      </div>
      <div
        className={`flex flex-col w-full h-[150px] overflow-x-hidden overflow-y-auto`}
      >
        <DataTable
          columns={tableSimilaresHeaders}
          IsLoading={false}
          TableData={Similares}
          ErrorMessage='Nenhum Similar encontrado'
        />
      </div>
      <footer className='flex gap-x-2'>
        <div className='w-fit'>
          <Button
            type='submit'
            className={`flex w-fit h-[35px] p-3 gap-3`}
            title='Salvar produto'
            ref={inputBtnSalvarRef}
          >
            <FontAwesomeIcon
              icon={faSave}
              size='xl'
              title='SALVAR'
              className='text-white'
            />
            SALVAR
          </Button>
        </div>
      </footer>
      {Modal && (
        <Modal Title={'BUSCAR PRODUTO'} containerStyle='w-[75%] h-[80%]'>
          <SuperSearchProducts
            words={WordProducts}
            data={SerachedProducts}
            CallBack={loadingProduct}
          />
        </Modal>
      )}
    </form>
  );
};

export default FormEdit;

