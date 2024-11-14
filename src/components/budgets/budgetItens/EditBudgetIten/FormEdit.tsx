'use client';
import { ResponseType } from '@/@types';
import { iItensOrcamento } from '@/@types/Orcamento';
import { iProduto, iTabelaVenda } from '@/@types/Produto';
import { iDataResultTable } from '@/@types/Table';
import { addItem, updateItem } from '@/app/actions/orcamento';
import { SuperFindProducts, TableFromProduct } from '@/app/actions/produto';
import { DataTable } from '@/components/CustomDataTable';
import SuperSearchProducts from '@/components/products/SuperSearchProduct';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import useModal from '@/hooks/useModal';
import { FormatToCurrency } from '@/lib/utils';
import { faSave, faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { tableChavesHeaders } from './columns';

interface iFormEditItem {
  item?: iItensOrcamento;
  budgetCode: number;
  CallBack?: () => void;
}

const FormEdit: React.FC<iFormEditItem> = ({ item, budgetCode, CallBack }) => {
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
  const [Tables, setTables] = useState<iTabelaVenda[]>([]);
  let [SerachedProducts, setSerachedProducts] = useState<
    iDataResultTable<iProduto>
  >({
    Qtd_Registros: 0,
    value: [],
  });
  const [WordProducts, setWordProducts] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function saveItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log('saveItem', {
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

    if (budgetItem.ORCAMENTO > 0) {
      const response = await updateItem({
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

      if (CallBack) {
        CallBack();
      }
    } else {
      const response = await addItem({
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

      if (response.value !== undefined && CallBack) {
        toast({
          title: 'Sucesso!',
          description: 'Item adicionado com sucesso',
          variant: 'success',
        });
        CallBack();
      }

      if (response.error !== undefined) {
        toast({
          title: 'Error!',
          description: 'Erro ao adicionar item',
          variant: 'destructive',
        });
      }

      console.log('save item response', response);
    }
  }

  async function getTablesFromProducts(product: iProduto) {
    const tablesResult: ResponseType<iTabelaVenda[]> = await TableFromProduct(
      product
    );

    if (tablesResult.value !== undefined) {
      setTables(tablesResult.value);
      setBudgetItem({
        ...budgetItem,
        TABELA: tablesResult.value[0].TABELA,
        VALOR: tablesResult.value[0].PRECO,
        SUBTOTAL: tablesResult.value[0].PRECO * budgetItem.QTD,
        TOTAL: tablesResult.value[0].PRECO * budgetItem.QTD,
      });
    }
  }

  async function loadingProduct(product: iProduto) {
    setBudgetItem(
      (old) =>
        (old = {
          ...budgetItem,
          PRODUTO: product,
          VALOR: product.PRECO,
          QTD: budgetItem.QTD,
          SUBTOTAL: budgetItem.VALOR * budgetItem.QTD,
          TOTAL: budgetItem.VALOR * budgetItem.QTD,
        })
    );
    await getTablesFromProducts(product);
    setWordProducts(product.PRODUTO);
    OnCloseModal();
  }

  async function findProduct() {
    setLoading(true);
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
        setLoading(false);
      });
  }

  useEffect(() => {
    return () => {
      if (item) {
        getTablesFromProducts(item.PRODUTO).finally(() => {
          setBudgetItem(
            (old) =>
              (old = {
                ...item,
                PRODUTO: item.PRODUTO,
                VALOR: item.PRODUTO.PRECO,
                QTD: item.QTD,
                SUBTOTAL: item.SUBTOTAL,
                TOTAL: item.TOTAL,
              })
          );
          setWordProducts(item.PRODUTO.PRODUTO);
        });
      }
    };
  }, []);

  return (
    <form
      onSubmit={saveItem}
      method='POST'
      className={`flex flex-col overflow-x-hidden overflow-y-auto gap-y-3 w-full
                                                            h-full py-0 px-2`}
    >
      <div
        className={`flex w-full h-[60vh] gap-3 overflow-x-hidden overflow-y-auto`}
      >
        <div className={`flex w-[70%] flex-col gap-y-3`}>
          <div className={`flex gap-x-3 px-3`}>
            <div className={`flex w-[30%] gap-x-1 items-end`}>
              <div className={`flex w-[85%]`}>
                <Input
                  onChange={(e) => setWordProducts(e.target.value)}
                  value={WordProducts}
                  name='ProdutoPalavras'
                  labelText='PRODUTO'
                  labelPosition='top'
                  disabled={item !== undefined}
                />
              </div>
              <div className={`flex w-[10%] mb-2`}>
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
              </div>
            </div>
            <div className={`flex w-[25%]`}>
              <Input
                disabled
                value={budgetItem.PRODUTO?.REFERENCIA}
                name='REFERÊNCIA'
                labelText='REFERÊNCIA'
                labelPosition='top'
              />
            </div>
            <div className={`flex w-[30%]`}>
              <Input
                disabled
                value={budgetItem.PRODUTO?.FABRICANTE?.NOME}
                name='FABRICANTE'
                labelText='FABRICANTE'
                labelPosition='top'
              />
            </div>
            <div className={`flex w-[15%]`}>
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
        <div className={`flex flex-col w-[30%]`}>
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
              setBudgetItem({
                ...budgetItem,
                QTD: Number(e.target.value),
                SUBTOTAL: budgetItem.VALOR * Number(e.target.value),
                TOTAL: budgetItem.VALOR * Number(e.target.value),
              });
            }}
            value={budgetItem.QTD}
            name='QTD'
            type='number'
            labelText='QTD'
            labelPosition='top'
            className='text-right'
          />
        </div>

        <div className={`flex w-[40%]`}>
          <Select
            defaultValue={budgetItem.TABELA}
            value={String(budgetItem.VALOR)}
            onValueChange={(e: any) => {
              const selectedTable = Tables.find((tb) => tb.TABELA === e);
              if (selectedTable) {
                setBudgetItem(
                  (old) =>
                    (old = { ...budgetItem, TABELA: selectedTable.TABELA })
                );
              }
            }}
          >
            <SelectTrigger className='w-full mb-2 text-emsoft_dark-text'>
              {budgetItem.TABELA}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Tables.map((tb) => (
                  <SelectItem
                    key={tb.TABELA}
                    value={String(tb.PRECO)}
                    className='text-emsoft_dark-text'
                  >
                    {tb.TABELA}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
      <footer className='flex gap-x-2'>
        <div className='w-fit'>
          <Button
            type='submit'
            className={`flex w-fit h-[35px] p-3 gap-3`}
            title='Salvar produto'
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

