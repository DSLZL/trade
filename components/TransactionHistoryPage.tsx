
import React from 'react';
import Header from './Header';
import TransactionHistory from './TransactionHistory';
import ErrorBoundary from './ErrorBoundary';

const TransactionHistoryPage: React.FC = () => {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
            <ErrorBoundary fallbackMessage="Could not load your transaction history.">
              <TransactionHistory />
            </ErrorBoundary>
        </main>
      </div>
    );
};

export default TransactionHistoryPage;
