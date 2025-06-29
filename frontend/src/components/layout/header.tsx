import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import {
  User,
  Moon,
  Sun,
  Monitor,
  LogOut,
  Pill,
  Menu,
  Crown,
} from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const { language, setTheme, setLanguage } = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = async (path: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    navigate(path);
    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }

    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const languages = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
  };

  return (
    <>
      <ProgressBar isLoading={isLoading} />
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 transition-opacity hover:opacity-80"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/dashboard');
              }}
            >
              <Pill className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">MedCare+</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/dashboard')}
                className="text-gray-700 dark:text-gray-200 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white px-4 py-2"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/medications')}
                className="text-gray-700 dark:text-gray-200 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white px-4 py-2"
              >
                Medications
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/adherence')}
                className="text-gray-700 dark:text-gray-200 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white px-4 py-2"
              >
                Adherence
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/analytics')}
                className="text-gray-700 dark:text-gray-200 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white px-4 py-2"
              >
                Analytics
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/reminders')}
                className="text-gray-700 dark:text-gray-200 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white px-4 py-2"
              >
                Reminders
              </Button>
            </nav>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            {/* Language Selector - Hidden on very small screens */}
            <div className="hidden sm:block">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languages).map(([code, name]) => (
                    <SelectItem key={code} value={code} className="text-foreground">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                <DropdownMenuItem
                  onClick={() => handleNavigation('/dashboard')}
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNavigation('/medications')}
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Medications
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNavigation('/adherence')}
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Adherence
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNavigation('/analytics')}
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleNavigation('/reminders')}
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Reminders
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/subscription')}>
                  <Crown className="mr-2 h-4 w-4" />
                  Premium
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}