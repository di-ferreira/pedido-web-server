'use client';
import { iCliente } from '@/@types/Cliente';
import { iItemInserir, iItensOrcamento, iOrcamento } from '@/@types/Orcamento';
import { iProduto } from '@/@types/Produto';
import { addItem, updateItem } from '@/app/actions/orcamento';
import { getErrorMessage } from '@/lib/utils';
import { DataTable } from '@/components/CustomDataTable';
import { Loading } from '@/components/Loading';
import ToastNotify from '@/components/ToastNotify';
import { SearchProductsModal } from '@/components/products/SearchProductsModal';
import SuperSearchProducts from '@/components/products/SuperSearchProduct';
import { Button } from '@/components/ui/button';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { useBudget } from '@/store';
import useProductStore from '@/store/useProductStore';
import { tableSalesHistoryHeaders } from './columns';
import ProductInfoSection from './ProductInfoSection';
import QuantityPriceSection from './QuantityPriceSection';
import { getSimilaresHeaders } from './similaresColumns';

interface iFormEditItem {
  item?: iItensOrcamento;
  budget: iOrcamento;
  CallBack?: () => void;
  onCloseModal?: () => void;
}

const FormEdit = ({ item, budget, CallBack, onCloseModal }: iFormEditItem) => {
  const { current, setCurrent } = useBudget();
  const {
    searchProducts,
    searchResult,
    selectProduct,
    isLoading,
    isOferta,
    productSelected,
    currentPrice,
    similares,
    history,
    clearDetails,
  } = useProductStore();
  const [IsVisibleModalProducts, setIsVisibleModalProducts] =
    useState<boolean>(false);
  const [budgetItem, setBudgetItem] = useState<iItensOrcamento>({
    QTD: 1,
    VALOR: 0,
    TOTAL: 0,
    SUBTOTAL: 0,
    DESCONTO: 0,
    TABELA:
      (budget.CLIENTE as iCliente).Tabela !== undefined ||
      (budget.CLIENTE as iCliente).Tabela !== ''
        ? (budget.CLIENTE as iCliente).Tabela!
        : 'SISTEMA',
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

  const [WordProducts, setWordProducts] = useState<string>('');
  const [QtdItem, setQtdItem] = useState<string>('1');
  const formRef = useRef<HTMLFormElement>(null);
  const inputProductRef = useRef<HTMLInputElement>(null);
  const inputQTDRef = useRef<HTMLInputElement>(null);
  const inputBtnSalvarRef = useRef<HTMLButtonElement>(null);

  async function saveItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let response;
    let message = '';
    const itemSave: iItemInserir = {
      pIdOrcamento: current.ORCAMENTO,
      pItemOrcamento: {
        CodigoProduto: WordProducts,
        Desconto: 0,
        Frete: 0,
        Qtd: budgetItem.QTD,
        Tabela: budgetItem.TABELA,
        Valor: currentPrice,
        SubTotal: budgetItem.SUBTOTAL,
        Total: budgetItem.TOTAL,
      },
    };

    if (item !== undefined) {
      response = await updateItem(itemSave);
      message = 'Item editado com sucesso';
    } else {
      response = await addItem(itemSave);
      message = 'Item adicionado com sucesso';
    }

    if (response?.value !== undefined) {
      setCurrent(response.value as iOrcamento);
      ToastNotify({
        message: message,
        type: 'success',
      });
    }

    if (response?.error !== undefined) {
      ToastNotify({
        message: 'Erro ao adicionar/editar item',
        type: 'error',
      });
      return;
    }

    if (CallBack) {
      CallBack();
    }

    if (item !== undefined) {
      if (onCloseModal) onCloseModal();
    } else {
      setWordProducts('');
      clearDetails();
      setBudgetItem({
        QTD: 1,
        VALOR: 0,
        TOTAL: 0,
        SUBTOTAL: 0,
        DESCONTO: 0,
        TABELA: (current.CLIENTE as iCliente).Tabela || 'SISTEMA',
        OBS: '',
        MD5: '',
        ITEM: 0,
        PRECO_LIQUIDO: '',
        IMP_SEPARACAO: '',
        GORDURA: 0,
        P_DESC: 0,
        ID_VALE_CASCO: 0,
        ORCAMENTO: current.ORCAMENTO,
        PRODUTO: {} as iProduto,
      });
      setQtdItem('1');
      setTimeout(() => inputProductRef.current?.focus(), 100);
    }
  }

  async function UpdateProduct(prod: iProduto) {
    let newQtd = 1;

    if (prod !== undefined) {
      newQtd = handleCalcQTD(budgetItem.QTD, prod);

      setBudgetItem(
        (old) =>
          (old = {
            ...budgetItem,
            PRODUTO: prod,
            VALOR: currentPrice,
            QTD: newQtd,
            SUBTOTAL: currentPrice * budgetItem.QTD,
            TOTAL: currentPrice * budgetItem.QTD,
          }),
      );

      if (prod.QTDATUAL - prod.QTD_GARANTIA <= 0) {
        ToastNotify({
          message: 'Produto sem estoque disponível para venda',
          type: 'error',
        });
      }

      setQtdItem((old) => (old = newQtd.toString()));
      setWordProducts(prod.PRODUTO);
      inputQTDRef.current?.focus();
    }
  }

  async function loadingProduct(product: iProduto) {
    selectProduct(product, current.CLIENTE as iCliente);
    setIsVisibleModalProducts(false);

    try {
      await UpdateProduct(product);
    } catch (e) {
      ToastNotify({
        message: `Erro inesperado ao carregar produto: ${getErrorMessage(e)}`,
        type: 'error',
      });
    }
  }

  async function findProduct() {
    const products = await searchProducts(WordProducts);

    if (products.length === 1) {
      await selectProduct(products[0], current.CLIENTE as iCliente);

      setBudgetItem((prev) => ({
        ...prev,
        PRODUTO: products[0],
        VALOR: productSelected?.PRECO || 0,
      }));

      setWordProducts(products[0].PRODUTO);
      inputQTDRef.current?.focus();
    } else if (products.length > 1) {
      setIsVisibleModalProducts(true);
    } else {
      ToastNotify({ message: 'Não encontrado', type: 'error' });
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

    const multiploCompra = Number(product.MULTIPLO_COMPRA) || 1;
    const qtdVenda = Number(product.QTD_VENDA) || 1;

    const multiplo = qtdVenda > 1 ? qtdVenda : multiploCompra;

    newQtd = Math.ceil(qtd / multiplo) * multiplo;

    if (newQtd > product.QTDATUAL - product.QTD_GARANTIA) {
      newQtd = product.QTDATUAL - product.QTD_GARANTIA;
    }

    return newQtd;
  };

  async function onChangeQTD(e: React.FocusEvent<HTMLInputElement>) {
    let newQtd = Number(e.target.value);

    if (Number.isNaN(newQtd) || newQtd < 1) {
      newQtd = 1;
    }
    const finalQtd = handleCalcQTD(newQtd, productSelected!);

    setQtdItem(finalQtd.toString());

    let total: number = currentPrice * finalQtd;

    setBudgetItem((prevBudgetItem) => ({
      ...prevBudgetItem,
      QTD: finalQtd,
      SUBTOTAL: total,
      TOTAL: total,
    }));
  }

  async function onQtdChange(e: React.ChangeEvent<HTMLInputElement>) {
    let newQtdText = e.target.value;
    let newQtd = Number(newQtdText);

    if (Number.isNaN(newQtd) || newQtd < 1) {
      newQtd = 1;
    }

    setQtdItem(newQtdText);

    setBudgetItem((prevBudgetItem) => ({
      ...prevBudgetItem,
      QTD: newQtd,
    }));
  }

  async function LoadItem() {
    if (item) {
      selectProduct(item.PRODUTO, budget.CLIENTE as iCliente);

      let new_price: number = item.PRODUTO.PRECO;

      new_price = new_price === undefined ? item.PRODUTO.PRECO : new_price;

      setBudgetItem(
        (old) =>
          (old = {
            ...item,
            PRODUTO: item.PRODUTO,
            VALOR: new_price,
            QTD: item.QTD,
            SUBTOTAL: item.SUBTOTAL,
            TOTAL: item.TOTAL,
          }),
      );
      setWordProducts(item.PRODUTO.PRODUTO);
      setQtdItem(item.QTD.toString());
    }
  }

  useEffect(() => {
    inputProductRef.current?.focus();

    const loadData = async () => {
      try {
        LoadItem();
      } catch (err) {
        ToastNotify({ message: getErrorMessage(err), type: 'error' });
      }
    };

    loadData();
  }, [current.ORCAMENTO, item?.PRODUTO.PRODUTO]);

  const priceRatio = productSelected?.PRECO
    ? currentPrice / productSelected.PRECO
    : 1;

  const tableSimilaresHeaders = getSimilaresHeaders({
    onAddSimilar: (similar) => loadingProduct(similar.EXTERNO),
    priceRatio,
  });

  return (
    <div className='relative w-full h-full'>
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
          <ProductInfoSection
            productSelected={productSelected}
            WordProducts={WordProducts}
            inputProductRef={inputProductRef}
            isEditing={item !== undefined}
            onWordChange={setWordProducts}
            onSearchKeyDown={OnSearchProduto}
          />
          <div className={`flex flex-col w-[30%] tablet:w-[40%]`}>
            <DataTable
              columns={tableSalesHistoryHeaders}
              IsLoading={false}
              TableData={history}
              ErrorMessage='Nenhuma Chave encontrada'
            />
          </div>
        </div>
        <QuantityPriceSection
          productSelected={productSelected}
          QtdItem={QtdItem}
          currentPrice={currentPrice}
          budgetTotal={budgetItem.TOTAL}
          isOferta={isOferta}
          inputQTDRef={inputQTDRef}
          inputBtnSalvarRef={inputBtnSalvarRef}
          onQtdChange={onQtdChange}
          onQtdBlur={onChangeQTD}
        />
        <div
          className={`flex flex-col w-full h-[150px] overflow-x-hidden overflow-y-auto`}
        >
          <DataTable
            columns={tableSimilaresHeaders}
            IsLoading={false}
            TableData={similares}
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
              disabled={
                budgetItem.PRODUTO?.QTDATUAL! -
                  budgetItem.PRODUTO?.QTD_GARANTIA! <=
                0
              }
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
          <div className='w-fit'>
            <Button
              type='button'
              className={`bg-emsoft_danger-main hover:bg-emsoft_danger-light flex w-fit h-[35px] p-3 gap-3`}
              title='SAIR'
              onClick={() => {
                onCloseModal && onCloseModal();
                clearDetails();
              }}
            >
              <FontAwesomeIcon
                icon={faTimes}
                size='xl'
                title='SALVAR'
                className='text-white'
              />
              SAIR
            </Button>
          </div>
        </footer>
        <SearchProductsModal
          modalTitle={'Busca de Produtos'}
          IsVisible={IsVisibleModalProducts}
        >
          <SuperSearchProducts
            words={WordProducts}
            data={{ value: searchResult, Qtd_Registros: searchResult.length }}
            CallBack={loadingProduct}
          />
        </SearchProductsModal>
      </form>
      {isLoading && <Loading />}
    </div>
  );
};

export default FormEdit;
