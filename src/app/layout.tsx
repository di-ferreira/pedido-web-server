import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';

const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'EMSoft Pedido Web',
  description: 'Sistema de orçamentos e pedidos para auto-peças',
  applicationName: 'Pedido Web',
  appleWebApp: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-br'>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          openSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}

