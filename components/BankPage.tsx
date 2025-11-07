

import React from 'react';
import Header from './Header';
import ErrorBoundary from './ErrorBoundary';
import LoanPanel from './LoanPanel';

const BankPage: React.FC = () => {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <ErrorBoundary fallbackMessage="Could not load the banking section.">
                    <LoanPanel />
                </ErrorBoundary>
            </div>
        </main>
      </div>
    );
};

export default BankPage;
