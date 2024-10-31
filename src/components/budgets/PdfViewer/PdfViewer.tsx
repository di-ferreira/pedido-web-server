import { iOrcamento } from '@/@types/Orcamento';
import {
  Document,
  Font,
  Image,
  Page,
  PDFViewer,
  Text,
  View,
} from '@react-pdf/renderer';
import { styles } from './style';

export interface PdfViewerProps {
  orc: iOrcamento;
}

Font.register({
  family: 'Montserrat',
  fonts: [
    {
      src: `${window.location.protocol}//${window.location.host}/assets/fonts/montserrat/Montserrat-Regular.ttf`,
    },
    {
      src: `${window.location.protocol}//${window.location.host}/assets/fonts/montserrat/Montserrat-Medium.ttf`,
      fontStyle: 'normal',
      fontWeight: 500,
    },
    {
      src: `${window.location.protocol}//${window.location.host}/assets/fonts/montserrat/Montserrat-Bold.ttf`,
      fontWeight: 700,
    },
  ],
});

// Create styles

export function PdfViewer({ orc }: PdfViewerProps) {
  const formatDate = (date: Date | number): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const DataAtual = formatDate(new Date());

  return (
    <PDFViewer width={'100%'} height={'100%'} showToolbar={true}>
      <Document language='PT-BR'>
        <Page wrap size='A4' style={styles.page}>
          {/*
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
            fixed
          />

          <View
            render={({ pageNumber }) =>
              pageNumber % 2 !== 0 && (
                <View style={{ backgroundColor: 'red' }}>
                  <Text>I'm only visible in odd pages!</Text>
                </View>
              )
            }
          /> */}

          <View style={styles.default}>
            {/* header  */}
            <View>
              <View style={styles.header}>
                <View style={styles.logo}>
                  <Image
                    src={`${window.location.protocol}//${window.location.host}/logo_15_novembro.jpeg`}
                  />
                </View>

                <View style={styles.headerColumn}>
                  <View style={styles.headerParagraph}>
                    <Text style={styles.headerParagraphTitle}>data:</Text>
                    <Text style={styles.headerParagraphValue}>{DataAtual}</Text>
                  </View>

                  <View style={styles.headerParagraph}>
                    <Text style={styles.headerParagraphTitle}>cliente:</Text>
                    <Text style={styles.headerParagraphValue}>
                      {orc.CLIENTE.NOME}
                    </Text>
                  </View>

                  <View style={styles.headerParagraph}>
                    <Text style={styles.headerParagraphTitle}>vendedor:</Text>
                    <Text style={styles.headerParagraphValue}>
                      {orc.VENDEDOR.NOME}
                    </Text>
                  </View>

                  <View style={styles.headerParagraph}>
                    <Text style={styles.headerParagraphTitle}>
                      nº orçamento:
                    </Text>
                    <Text style={styles.headerParagraphValue}>
                      {orc.ORCAMENTO}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.headerLine}></View>
            </View>
            {/* body */}
            <View style={styles.body}>
              {/* Tabela */}
              <View style={styles.table}>
                {/* Cabeçalho da Tabela */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={styles.tableColProd}>
                    <Text style={styles.tableCell}>Produto</Text>
                  </View>
                  <View style={styles.tableColQtd}>
                    <Text style={styles.tableCell}>Qtd</Text>
                  </View>
                  <View style={styles.tableColDesc}>
                    <Text style={styles.tableCell}>Descrição</Text>
                  </View>
                  <View style={styles.tableColValor}>
                    <Text style={styles.tableCell}>Valor</Text>
                  </View>
                  <View style={styles.tableColTotal}>
                    <Text style={styles.tableCell}>Total</Text>
                  </View>
                </View>

                {/* Linhas da Tabela */}
                {orc.ItensOrcamento.map((item, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <View style={styles.tableColProd}>
                      <Text style={styles.tableCell}>
                        {item.PRODUTO.PRODUTO}
                      </Text>
                    </View>
                    <View style={styles.tableColQtd}>
                      <Text style={styles.tableCell}>{item.QTD}</Text>
                    </View>
                    <View style={styles.tableColDesc}>
                      <Text style={styles.tableCell}>
                        {item.PRODUTO.APLICACOES}
                      </Text>
                    </View>
                    <View style={styles.tableColValor}>
                      <Text style={styles.tableCell}>
                        {item.TOTAL.toLocaleString('pt-br', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </Text>
                    </View>
                    <View style={styles.tableColTotal}>
                      <Text style={styles.tableCell}>
                        {item.TOTAL.toLocaleString('pt-br', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              {/*TOTAL*/}
              <View style={styles.total}>
                <Text>TOTAL:</Text>
                <Text>__________________________________________</Text>

                <Text>
                  {orc.TOTAL.toLocaleString('pt-br', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </Text>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
}

