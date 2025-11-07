

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import { Tooltip } from './ui/Tooltip';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, login, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentLanguage = i18n.language;
  const currentPath = window.location.pathname;

  const changeLanguage = (lang: 'en' | 'zh-CN') => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    const body = document.body;
    if (isMobileMenuOpen) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = 'auto';
    }
    return () => {
      body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isMobileMenuOpen]);

  const renderNavLinks = (isMobile = false) => (
    <>
      <a
        href="/"
        className={cn(
          "font-medium transition-colors hover:text-primary",
          isMobile ? "text-lg" : "text-sm",
          currentPath === '/' ? 'text-primary' : 'text-muted-foreground'
        )}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        {t('header.nav.dashboard')}
      </a>
      <a
        href="/bank"
        className={cn(
          "font-medium transition-colors hover:text-primary",
          isMobile ? "text-lg" : "text-sm",
          currentPath === '/bank' ? 'text-primary' : 'text-muted-foreground'
        )}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        {t('header.nav.bank')}
      </a>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <a href="/" aria-label={t('header.homeLink')} className="flex items-center space-x-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-.567-.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.879 3.197A1 1 0 108.18 13.5c.08.45-2.223a3.004 3.004 0 015.63-1.043 3 3 0 011.87-1.745 1 1 0 10-1.16-1.638A4.5 4.5 0 0011 4.092V3zM7.5 10.5a1 1 0 10-2 0v3a1 1 0 102 0v-3zm3 0a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4.5-.5a1 1 0 01-1 1v3a1 1 0 11-2 0v-3a1 1 0 111-1z" clipRule="evenodd" />
              </svg>
              <span className="hidden font-bold sm:inline-block">{t('header.title')}</span>
            </a>
            <nav className="hidden items-center gap-6 md:flex">
                {renderNavLinks(false)}
            </nav>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
              <Tooltip text={t('header.languageSwitcher')}>
                  <div className="flex items-center rounded-md border p-1 text-sm">
                      <button onClick={() => changeLanguage('en')} className={cn("px-2 py-0.5 rounded-sm", { "bg-muted": currentLanguage === 'en' })}>EN</button>
                      <button onClick={() => changeLanguage('zh-CN')} className={cn("px-2 py-0.5 rounded-sm", { "bg-muted": currentLanguage.startsWith('zh') })}>中</button>
                  </div>
              </Tooltip>
              {isLoading ? (
                  <div className="h-10 w-20 animate-pulse rounded-md bg-muted"></div>
              ) : user ? (
                  <div className="group relative">
                      <button className="flex items-center space-x-2">
                          <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full" />
                          <span className="hidden text-sm font-medium text-foreground sm:block">{user.name}</span>
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md bg-card shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ zIndex: 51 }}>
                          <div className="py-1">
                              <button onClick={logout} className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent">
                                  {t('header.logout')}
                              </button>
                          </div>
                      </div>
                  </div>
              ) : (
                  <Button onClick={login}>{t('header.login')}</Button>
              )}

              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-md p-2 text-sm font-medium md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open main menu"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          'fixed inset-0 z-50 md:hidden',
          isMobileMenuOpen ? 'block' : 'hidden'
        )}
      >
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="fixed right-0 top-0 h-full w-full max-w-xs bg-background p-6">
          <div className="flex items-center justify-between">
            <a href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-.567-.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.879 3.197A1 1 0 108.18 13.5c.08.45-2.223a3.004 3.004 0 015.63-1.043 3 3 0 011.87-1.745 1 1 0 10-1.16-1.638A4.5 4.5 0 0011 4.092V3zM7.5 10.5a1 1 0 10-2 0v3a1 1 0 102 0v-3zm3 0a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4.5-.5a1 1 0 01-1 1v3a1 1 0 11-2 0v-3a1 1 0 111-1z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">{t('header.title')}</span>
            </a>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="mt-8 flex flex-col space-y-4">
            {renderNavLinks(true)}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
