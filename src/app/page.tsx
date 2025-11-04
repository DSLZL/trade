"use client";

import React from 'react';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import TradePanel from '../components/TradePanel';
import TransactionHistory from '../components/TransactionHistory';
import ErrorBoundary from '../components/ErrorBoundary';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary fallbackMessage="Could not load your portfolio summary.">
              <Dashboard />
            </ErrorBoundary>
            <ErrorBoundary fallbackMessage="The trading panel could not be loaded. Please try again later.">
              <TradePanel />
            </ErrorBoundary>
          </div>
          <div className="lg:col-span-1">
             <ErrorBoundary fallbackMessage="Could not load your transaction history.">
                <TransactionHistory />
             </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
};
