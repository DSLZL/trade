"use client";

import React from 'react';
import { PriceProvider } from '../hooks/useBitcoinPrice';
import { PortfolioProvider } from '../hooks/usePortfolio';
import '../i18n'; // Initialize i18next

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <React.StrictMode>
      <React.Suspense fallback="Loading...">
        <PriceProvider>
          <PortfolioProvider>
            {children}
          </PortfolioProvider>
        </PriceProvider>
      </React.Suspense>
    </React.StrictMode>
  );
}
