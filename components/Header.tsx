
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import { Tooltip } from './ui/Tooltip';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, login, logout, isLoading } = useAuth();
  const currentLanguage = i18n.language;
  const currentPath = window.location.pathname;

  const changeLanguage = (lang: 'en' | 'zh-CN') => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-6 md:gap-10">
           <a href="/" aria-label={t('header.homeLink')} className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-.567-.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.879 3.197A1 1 0 108.18 13.5c.08.44.276.826.54 1.126v1.274a1 1 0 102 0v-1.274c.263-.299.459-.685.54-1.125a1 1 0 101.96-
.389A4.5 4.5 0 0011 5.092V5zM9 13.5a2.5 2.5 0 015 0c0 .906-.323 1.74-.86 2.373A1 1 0 1111.707 17c.535-.632.86-1.468.86-2.373a3.5 3.5 0 10-7 0c0 .01.002.02.002.03a1 1 0 01-2-.03c0-1.92 1.58-3.5 3.5-3.5z" clipRule="evenodd" />
            </svg>
            <span className="inline-block font-bold">{t('header.title')}</span>
          </a>
          {/* Main Navigation */}
          <nav className="hidden md:flex gap-6">
            <a href="/" className={cn("text-sm font-medium transition-colors hover:text-primary", currentPath === '/' ? 'text-primary' : 'text-muted-foreground')}>
              {t('header.nav.dashboard')}
            </a>
            <a href="/history" className={cn("text-sm font-medium transition-colors hover:text-primary", currentPath === '/history' ? 'text-primary' : 'text-muted-foreground')}>
              {t('header.nav.history')}
            </a>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1" aria-label={t('header.languageSwitcher')}>
            <Tooltip text={t('header.tooltips.switchToZh')}>
              <Button
                variant={currentLanguage === 'zh-CN' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => changeLanguage('zh-CN')}
                aria-label={t('header.tooltips.switchToZh')}
                aria-pressed={currentLanguage === 'zh-CN'}
              >
                {t('languages.zh')}
              </Button>
            </Tooltip>
            <Tooltip text={t('header.tooltips.switchToEn')}>
              <Button
                variant={currentLanguage.startsWith('en') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => changeLanguage('en')}
                aria-label={t('header.tooltips.switchToEn')}
                aria-pressed={currentLanguage.startsWith('en')}
              >
                {t('languages.en')}
              </Button>
            </Tooltip>
          </nav>

          {/* User Profile Section */}
          <div className="flex items-center space-x-2">
            {!isLoading && user ? (
              <>
                <div className="flex items-center space-x-2">
                    <img src={user.avatarUrl} alt={t('header.userProfile')} className="h-8 w-8 rounded-full" />
                    <span className="text-sm font-medium hidden sm:inline-block">{user.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  {t('header.logout')}
                </Button>
              </>
            ) : !isLoading && (
              <Button variant="default" size="sm" onClick={login}>
                {t('header.login')}
              </Button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
