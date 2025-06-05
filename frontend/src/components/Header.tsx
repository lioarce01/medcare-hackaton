import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Pill, LineChart, LogOut, Home, Bell } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useSignOut } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useSession } from '../hooks/useSession';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header: React.FC = () => {
  const { data: user } = useUser();
  const { mutate: logout } = useSignOut()
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { i18n } = useTranslation();
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
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center">
              <Pill className="text-blue-600" size={24} />
              <span className="ml-2 text-xl font-bold text-gray-800">MedTracker</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {session ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } transition-colors`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/medications" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/medications')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } transition-colors`}
                >
                  Medications
                </Link>
                <Link 
                  to="/adherence" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/adherence')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } transition-colors`}
                >
                  Adherence
                </Link>
                <Link 
                  to="/analytics" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/analytics')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } transition-colors`}
                >
                  Analytics
                </Link>
                
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
                    Profile
                  </Link>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="ml-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center"
                >
                  <LogOut className="mr-1" size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Sign Up
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
              <Link
                to="/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/dashboard')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } transition-colors`}
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <Home className="mr-2" size={18} />
                  Dashboard
                </div>
              </Link>
              <Link
                to="/medications"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/medications')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } transition-colors`}
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <Pill className="mr-2" size={18} />
                  Medications
                </div>
              </Link>
              <Link
                to="/adherence"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/adherence')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } transition-colors`}
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <Bell className="mr-2" size={18} />
                  Adherence
                </div>
              </Link>
              <Link
                to="/analytics"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/analytics')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } transition-colors`}
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <LineChart className="mr-2" size={18} />
                  Analytics
                </div>
              </Link>
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
                  Profile
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
                  Logout
                </div>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={closeMenu}
              >
                Sign Up
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