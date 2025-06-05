import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Pill, LogOut, Home } from 'lucide-react';
import { useSignOut } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useSession } from '../hooks/useSession';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header: React.FC = () => {
  const { mutate: logout } = useSignOut()
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { data: session } = useSession();
  
  const handleLogout = () => {
    logout();
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navigation = [
    { name: t('header.navigation.dashboard'), href: '/dashboard' },
    { name: t('header.navigation.medications'), href: '/medications' },
    { name: t('header.navigation.adherence'), href: '/adherence' },
    { name: t('header.navigation.analytics'), href: '/analytics' },
  ];
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center">
              <Pill className="text-blue-600" size={24} />
              <span className="ml-2 text-xl font-bold text-gray-800">{t('header.app_name')}</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {session ? (
              <>
                {navigation.map((item) => (
                  <Link 
                    key={item.href}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } transition-colors`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Profile Dropdown */}
                <div className="relative ml-3">
                  <Link 
                    to="/profile" 
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/profile')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } transition-colors`}
                  >
                    <User className="mr-1" size={18} />
                    {t('header.navigation.profile')}
                  </Link>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="ml-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center"
                >
                  <LogOut className="mr-1" size={18} />
                  {t('header.navigation.logout')}
                </button>
              </>
            ) : (
              <>
                {navigation.map((item) => (
                  <Link 
                    key={item.href}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors`}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link 
                  to="/login" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {t('header.navigation.login')}
                </Link>
                <Link 
                  to="/register" 
                  className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {t('header.navigation.sign_up')}
                </Link>
              </>
            )}
            {/* Language Switcher */}
            <div className="ml-4">
              <LanguageSwitcher />
            </div>
          </nav>
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {session ? (
            <>
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } transition-colors`}
                  onClick={closeMenu}
                >
                  <div className="flex items-center">
                    <Home className="mr-2" size={18} />
                    {item.name}
                  </div>
                </Link>
              ))}
              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/profile')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } transition-colors`}
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <User className="mr-2" size={18} />
                  {t('header.navigation.profile')}
                </div>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <div className="flex items-center">
                  <LogOut className="mr-2" size={18} />
                  {t('header.navigation.logout')}
                </div>
              </button>
            </>
          ) : (
            <>
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors`}
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                onClick={closeMenu}
              >
                {t('header.navigation.login')}
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={closeMenu}
              >
                {t('header.navigation.sign_up')}
              </Link>
            </>
          )}
          {/* Language Switcher for mobile */}
          <div className="mt-2">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};