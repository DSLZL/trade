
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PriceProvider } from './hooks/useBitcoinPrice';
import { PortfolioProvider, usePortfolio } from './hooks/usePortfolio';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TradePanel from './components/TradePanel';
import ErrorBoundary from './components/ErrorBoundary';
import { Toast } from './components/ui/Toast';
import LiveTradeFeed from './components/LiveTradeFeed';
import AuthCallback from './components/AuthCallback';
import TransactionHistoryPage from './components/TransactionHistoryPage';

const ToastManager: React.FC = () => {
    const { notification, clearNotification } = usePortfolio();
    const { t } = useTranslation();

    // Automatically clear the notification after a delay
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 4000); // 4 seconds
            return () => clearTimeout(timer);
        }
    }, [notification, clearNotification]);

    if (!notification) {
        return null;
    }

    return (
        <Toast
            // FIX: Explicitly cast the result of t() to a string.
            // The `t` function from i18next has a broad return type that includes objects,
            // but for our notification messages, it will always resolve to a string.
            message={t(notification.messageKey, notification.payload) as string}
            type={notification.type}
            onClose={clearNotification}
        />
    );
};

const MainApp: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column (or top on mobile) */}
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary fallbackMessage="Could not load your portfolio summary.">
              <Dashboard />
            </ErrorBoundary>
            <ErrorBoundary fallbackMessage="The trading panel could not be loaded. Please try again later.">
              <TradePanel />
            </ErrorBoundary>
          </div>

          {/* Right Column (or bottom on mobile) */}
          <div className="lg:col-span-1 space-y-6">
              <ErrorBoundary fallbackMessage="Could not load the live trade feed.">
                <LiveTradeFeed />
              </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  )
}

const App: React.FC = () => {
  const renderContent = () => {
    // Simple routing based on path
    const path = window.location.pathname;
    if (path === '/auth/callback') {
      return <AuthCallback />;
    }
    if (path === '/history') {
        return <TransactionHistoryPage />;
    }
    return <MainApp />;
  };

  return (
    <PriceProvider>
      <PortfolioProvider>
        <AuthProvider>
          <ToastManager />
          {renderContent()}
        </AuthProvider>
      </PortfolioProvider>
    </PriceProvider>
  );
};

export default App;
