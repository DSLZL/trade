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
      body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const renderNavLinks = (isMobile = false) => (
    <>
      <a
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-brand-blue",
          isMobile ? "text-lg py-2" : "",
          currentPath === '/' ? 'text-brand-blue' : 'text-muted-foreground'
        )}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        {t('header.nav.dashboard')}
      </a>
      <a
        href="/bank"
        className={cn(
          "text-sm font-medium transition-colors hover:text-brand-blue",
          isMobile ? "text-lg py-2" : "",
          currentPath === '/bank' ? 'text-brand-blue' : 'text-muted-foreground'
        )}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        {t('header.nav.bank')}
      </a>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" aria-label={t('header.homeLink')} className="flex items-center space-x-2 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/20 group-hover:bg-brand-blue/30 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-blue" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-.567-.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.879 3.197A1 1 0 108.18 13.5c.08.45-2.223a3.004 3.004 0 015.63-1.043 3 3 0 011.87-1.745 1 1 0 10-1.16-1.638A4.5 4.5 0 0011 4.092V3zM7.5 10.5a1 1 0 10-2 0v3a1 1 0 102 0v-3zm3 0a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4.5-.5a1 1 0 01-1 1v3a1 1 0 11-2 0v-3a1 1 0 111-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="hidden font-bold text-lg tracking-tight sm:inline-block text-foreground">{t('header.title')}</span>
            </a>
            <nav className="hidden items-center gap-6 md:flex">
                {renderNavLinks(false)}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
              <Tooltip text={t('header.languageSwitcher')}>
                  <div className="flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 p-1 text-xs">
                      <button 
                        onClick={() => changeLanguage('en')} 
                        className={cn(
                            "px-3 py-1 rounded-full transition-all", 
                            currentLanguage === 'en' ? "bg-zinc-800 text-white shadow-sm" : "text-muted-foreground hover:text-white"
                        )}
                      >
                        EN
                      </button>
                      <button 
                        onClick={() => changeLanguage('zh-CN')} 
                        className={cn(
                            "px-3 py-1 rounded-full transition-all", 
                            currentLanguage.startsWith('zh') ? "bg-zinc-800 text-white shadow-sm" : "text-muted-foreground hover:text-white"
                        )}
                      >
                        中
                      </button>
                  </div>
              </Tooltip>
              
              {isLoading ? (
                  <div className="h-9 w-24 animate-pulse rounded-md bg-muted"></div>
              ) : user ? (
                  <div className="group relative">
                      <button className="flex items-center space-x-2 rounded-full border border-transparent hover:border-zinc-800 p-1 transition-all">
                          <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-blue/20" />
                          <span className="hidden text-sm font-medium text-zinc-200 sm:block px-2">{user.name}</span>
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-xl ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100" style={{ zIndex: 51 }}>
                          <button onClick={logout} className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-zinc-900 rounded-md transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                {t('header.logout')}
                          </button>
                      </div>
                  </div>
              ) : (
                  <Button onClick={login} size="sm" className="rounded-full px-6 bg-brand-blue hover:bg-brand-blue/90 text-white shadow-lg shadow-brand-blue/20">
                    {t('header.login')}
                  </Button>
              )}

              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
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
          'fixed inset-0 z-50 md:hidden transition-all duration-300',
          isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      >
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className={cn(
            "fixed right-0 top-0 h-full w-3/4 max-w-xs bg-zinc-950 border-l border-zinc-800 p-6 shadow-2xl transition-transform duration-300",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex items-center justify-between mb-8">
            <span className="font-bold text-xl">{t('header.title')}</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col space-y-4">
            {renderNavLinks(true)}
            
            <div className="border-t border-zinc-800 pt-6 mt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">{t('header.languageSwitcher')}</p>
              <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => changeLanguage('en')} 
                    className={cn(
                      "flex items-center justify-center px-4 py-2 rounded-lg text-sm border transition-all", 
                      currentLanguage === 'en' ? "bg-brand-blue text-white border-brand-blue" : "border-zinc-800 text-muted-foreground hover:bg-zinc-900"
                    )}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => changeLanguage('zh-CN')} 
                    className={cn(
                      "flex items-center justify-center px-4 py-2 rounded-lg text-sm border transition-all", 
                      currentLanguage.startsWith('zh') ? "bg-brand-blue text-white border-brand-blue" : "border-zinc-800 text-muted-foreground hover:bg-zinc-900"
                    )}
                  >
                    中文
                  </button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;