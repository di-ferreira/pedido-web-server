'use client';
import { DataTable } from '@/components/CustomDataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  faSave,
  faSearch,
  faSpinner,
  faStore,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { tableChavesHeaders } from './columns';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { iItensOrcamento } from '@/@types/Orcamento';
import { FormatToCurrency } from '@/lib/utils';
import { iProduto, iTabelaVenda } from '@/@types/Produto';
import { SuperFindProducts, TableFromProduct } from '@/app/actions/produto';
import { ResponseType } from '@/@types';
import { iDataResultTable } from '@/@types/Table';
import { addItem, updateItem } from '@/app/actions/orcamento';

interface iFormEditItem {
  item?: iItensOrcamento;
  budgetCode: number;
  CallBack?: () => void;
}

const FormEdit: React.FC<iFormEditItem> = ({ item, budgetCode, CallBack }) => {
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
  let SerachedProducts: iDataResultTable<iProduto> = {
    Qtd_Registros: 0,
    value: [],
  };
  const [WordProducts, setWordProducts] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function saveItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('Produto budget ->', budgetItem.PRODUTO);

    console.log('Save Item', {
      pIdOrcamento: budgetCode,
      pItemOrcamento: {
        CodigoProduto: budgetItem.PRODUTO.PRODUTO,
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
          CodigoProduto: budgetItem.PRODUTO.PRODUTO,
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

      console.log('Update item response ->', response);
    } else {
      const response = await addItem({
        pIdOrcamento: budgetCode,
        pItemOrcamento: {
          CodigoProduto: budgetItem.PRODUTO.PRODUTO,
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
        CallBack();
      }
      console.log('Save item response ->', response);
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

  async function findProduct() {
    let pd: iProduto = {
      PRODUTO: '',
      REFERENCIA: '',
      LOCAL: null,
      NOME: '',
      OUTROLADO: null,
      REFERENCIA2: '',
      QTDATUAL: 0,
      QTDMINIMA: 0,
      CUSTO: 0,
      CUSTOMEDIO: 0,
      PRECO: 0,
      PRECOWEB: null,
      DT_COMPRA: '',
      DT_VENDA: '',
      COMISSAO: 0,
      UNIDADE_TRIB_CONVERSAO: null,
      TRIBUTO: '',
      DESCONTO: 0,
      SERVICO: '',
      APLICACOES: '',
      ATIVO: '',
      INSTRUCOES: null,
      MARGEM_SEGURANCA: 0,
      MARGEM_MAXIMA: null,
      QTD_VENDA: 0,
      CURVA: '',
      USAR_MARGEM_CURVA: '',
      MARGEM_CURVA: 0,
      CURVA_ESTOQUE: '',
      CURVA_FREQUENCIA: null,
      ETIQUETA: '',
      COMPRA: '',
      CST: '',
      ICMS: 0,
      IPI: null,
      ST: null,
      QTD_MAXIMA: 0,
      QTD_SEGURANCA: 0,
      QTD_GARANTIA: 0,
      LOCAL2: null,
      LOCAL3: null,
      Atualizar: '',
      PESO: null,
      FAB_BRUTO: 0,
      FAB_DESC: null,
      FAB_IPI: null,
      FAB_LIQUIDO1: null,
      FAB_ST: null,
      FAB_FRETE: null,
      FAB_LIQUIDO2: null,
      QTD_EMBALAGEM: null,
      DEPARTAMENTO: 0,
      DT_CURVA_EST: null,
      DT_CURVA_FAB: null,
      CURVA_ANTERIOR: null,
      USUARIO: '',
      DATA_HORA: '',
      SIMP: null,
      CFOP_DE: '',
      CFOP_FE: '',
      MULTIPLO_COMPRA: 0,
      TRANCAR: '',
      WEB: '',
      CFOP_DEV_DE: '',
      CFOP_DEV_FE: '',
      COMISSAO_TELEMARKETING: null,
      VOLUME: 0,
      IMPORTADO: null,
      LARGURA: null,
      ALTURA: null,
      COMPRIMENTO: null,
      ID_MONTADORA: null,
      PAGINA_CATALOGO: null,
      ORDEM_CATALOGO: null,
      DT_CADASTRO: null,
      VENDA: '',
      OBS1: null,
      OBS2: null,
      FAB_BRUTO_OFERTA: null,
      FAB_DESC_OFERTA: null,
      FAB_IPI_OFERTA: null,
      FAB_LIQUIDO1_OFERTA: null,
      FAB_ST_OFERTA: null,
      FAB_FRETE_OFERTA: null,
      FAB_LIQUIDO2_OFERTA: null,
      VENDA_COM_OFERTA: null,
      MARGEM_OFERTA: null,
      PRECO_COM_OFERTA: null,
      FAB_OFERTA_VALIDADE: null,
      CNA: null,
      CODIGO_BARRA_CAIXA: null,
      QTD_CAIXA: null,
      QTD_MAX_ARMAZENAGEM: null,
      DATA_ATUALIZACAO: null,
      COMISSAO_HOME_OFFICE: null,
      COMISSAO_PROMOTOR: null,
      COMISSAO_ASSISTENTE: null,
      COMISSAO_MECANICO: null,
      IA: null,
      FCI: null,
      LINHA: null,
      NAO_DEVOLVER: null,
      STATUS: null,
      CTA_SPED_CONTRIB_E: null,
      CTA_SPED_CONTRIB_S: null,
      RESPONSABILIDADE_ICMS: null,
      RETENCAO_PIS_COFINS: null,
      NOVO_PRECO: null,
      NOVO_CUSTO: null,
      DATA_NOVO_PRECO: null,
      DATA_OFERTA_NOVO_PRECO: null,
      ID_NOVO_PRECO: null,
      FABRICANTE: {
        FABRICANTE: 0,
        NOME: '',
        CONTATO: '',
        ENDERECO: '',
        BAIRRO: '',
        CIDADE: '',
        UF: '',
        CEP: '',
        CGC: '',
        INSCRICAO: '',
        TELEFONE: '',
        OBS: '',
        MARGEM_CURVA_A: 0,
        MARGEM_CURVA_B: 0,
        MARGEM_CURVA_C: 0,
        PERC_CURVA_A: 0,
        PERC_CURVA_B: 0,
        PERC_CURVA_C: 0,
        MARGEM_CURVA_D: 0,
        MARGEM_CURVA_E: 0,
        MARGEM_CURVA_F: 0,
        MARGEM_CURVA_G: 0,
        PERC_CURVA_D: 0,
        PERC_CURVA_E: 0,
        PERC_CURVA_F: 0,
        PERC_CURVA_G: 0,
        ATUALIZAR: '',
        LER_CODIGO_BARRAS: '',
        MARGEM: 0,
        IA: 0,
        LINHA: '',
        COTACAO: '',
        FORNECEDOR: 0,
        ENDERECO_NUM: '',
        ENDERECO_CPL: '',
        ENDERECO_COD_MUN: 0,
        ENDERECO_COD_UF: 0,
        EMAIL: '',
        PREFERENCIAL: '',
        LUCRO_REAL: '',
        AJUSTA_CUSTO: '',
        MVA: 0,
        ID_CONTA: 0,
        ID_SUBCONTA: 0,
        APELIDO: '',
        MOVTO_GARANTIA: '',
        EMAIL_PEDIDO: '',
        ID_CONDICAO_PAGAMENTO: 0,
        ID_TRANSPORTADORA: 0,
        DIAS_ENTREGA: 0,
        FORMA_COMPRA: '',
        PERC_CCN: 0,
        PERC_CSN: 0,
        PERC_DESC_CCN: 0,
        PERC_DESC_CSN: 0,
        PERC_FRETE: 0,
        PERC_MARKUP: 0,
        FRETE_LIMITE: 0,
        FRETE_VALOR: 0,
        FRETE_PERC: 0,
        IPI_SN: '',
        GRUPO: 0,
        TIPO_FNC: '',
        DATA_ATUALIZACAO: '',
        NIVEL_ACESSO: 0,
        SISPAG: '',
        VALOR_MIN_COMPRA: 0,
        PENDENCIA: '',
      },
      FORNECEDOR: {
        FABRICANTE: 0,
        NOME: '',
        CONTATO: '',
        ENDERECO: '',
        BAIRRO: '',
        CIDADE: '',
        UF: '',
        CEP: '',
        CGC: '',
        INSCRICAO: '',
        TELEFONE: '',
        OBS: '',
        MARGEM_CURVA_A: 0,
        MARGEM_CURVA_B: 0,
        MARGEM_CURVA_C: 0,
        PERC_CURVA_A: 0,
        PERC_CURVA_B: 0,
        PERC_CURVA_C: 0,
        MARGEM_CURVA_D: 0,
        MARGEM_CURVA_E: 0,
        MARGEM_CURVA_F: 0,
        MARGEM_CURVA_G: 0,
        PERC_CURVA_D: 0,
        PERC_CURVA_E: 0,
        PERC_CURVA_F: 0,
        PERC_CURVA_G: 0,
        ATUALIZAR: '',
        LER_CODIGO_BARRAS: '',
        MARGEM: 0,
        IA: 0,
        LINHA: '',
        COTACAO: '',
        FORNECEDOR: 0,
        ENDERECO_NUM: '',
        ENDERECO_CPL: '',
        ENDERECO_COD_MUN: 0,
        ENDERECO_COD_UF: 0,
        EMAIL: '',
        PREFERENCIAL: '',
        LUCRO_REAL: '',
        AJUSTA_CUSTO: '',
        MVA: 0,
        ID_CONTA: 0,
        ID_SUBCONTA: 0,
        APELIDO: '',
        MOVTO_GARANTIA: '',
        EMAIL_PEDIDO: '',
        ID_CONDICAO_PAGAMENTO: 0,
        ID_TRANSPORTADORA: 0,
        DIAS_ENTREGA: 0,
        FORMA_COMPRA: '',
        PERC_CCN: 0,
        PERC_CSN: 0,
        PERC_DESC_CCN: 0,
        PERC_DESC_CSN: 0,
        PERC_FRETE: 0,
        PERC_MARKUP: 0,
        FRETE_LIMITE: 0,
        FRETE_VALOR: 0,
        FRETE_PERC: 0,
        IPI_SN: '',
        GRUPO: 0,
        TIPO_FNC: '',
        DATA_ATUALIZACAO: '',
        NIVEL_ACESSO: 0,
        SISPAG: '',
        VALOR_MIN_COMPRA: 0,
        PENDENCIA: '',
      },
      ListaSimilares: [],
      iListaVendaCasada: [],
      iListaOfertaProduto: [],
      ListaChaves: [],
    };
    setLoading(true);
    SuperFindProducts({
      filter: [{ key: 'PRODUTO', value: WordProducts }],
    })
      .then(async (products: ResponseType<iDataResultTable<iProduto>>) => {
        console.log('find Products', products);

        if (products.value !== undefined) {
          if (products.value!.Qtd_Registros === 1) {
            console.log('Find Product', products.value!.value[0]);
            pd = products.value!.value[0];
            setBudgetItem(
              (old) =>
                (old = {
                  ...budgetItem,
                  PRODUTO: products.value!.value[0],
                  VALOR: products.value!.value[0].PRECO,
                  QTD: budgetItem.QTD,
                  SUBTOTAL: budgetItem.VALOR * budgetItem.QTD,
                  TOTAL: budgetItem.VALOR * budgetItem.QTD,
                })
            );
            await getTablesFromProducts(products.value!.value[0]);
          }

          SerachedProducts = {
            Qtd_Registros: products.value!.Qtd_Registros,
            value: products.value!.value,
          };
        }

        if (products.error !== undefined)
          console.error('Error find Products', products.error);
      })
      .catch((e) => {
        console.error('Error find Products', e);
      })
      .finally(() => {
        setBudgetItem(
          (old) =>
            (old = {
              ...budgetItem,
              PRODUTO: pd,
              VALOR: pd.PRECO,
              QTD: 1,
              SUBTOTAL: pd.PRECO * budgetItem.QTD,
              TOTAL: pd.PRECO * budgetItem.QTD,
            })
        );
        setLoading(false);
        console.log('pd ->', pd);
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
        console.log('Item ->', item);
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
              console.log('change select');
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
            title='Buscar Produto'
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
        {/* <div className='w-fit'>
          <Button
            type='submit'
            onClick={() => {}}
            className={`flex w-fit h-[35px] p-3 gap-3`}
            title='ESTOQUE LOJAS'
          >
            <FontAwesomeIcon
              icon={faStore}
              size='xl'
              title='SALVAR'
              className='text-white'
            />
            ESTOQUE LOJAS
          </Button>
        </div> */}
      </footer>
    </form>
  );
};

export default FormEdit;

