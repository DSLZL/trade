import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'CryptoSim: Virtual Bitcoin Trading Platform',
  description: 'A web application that simulates a real Bitcoin (BTC) trading environment. Users can use virtual funds to practice buying and selling BTC, with real-time price data and historical trend charts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
