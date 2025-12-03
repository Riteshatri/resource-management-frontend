import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Home,
  User,
  Settings,
  Palette,
  Users,
  LogOut,
  FolderOpen,
  Menu,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName =
    (user as any)?.displayName ||
    (user as any)?.display_name ||
    user?.email?.split('@')[0] ||
    'User';

  const avatarLetter = userName[0]?.toUpperCase() || 'U';

  const userRole = (user as any)?.role;
  const isAdmin = userRole === 'admin';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/resources', label: 'Resources', icon: FolderOpen },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/theme-settings', label: 'Theme', icon: Palette },
    ...(isAdmin ? [{ to: '/settings', label: 'Settings', icon: Settings }] : []),
    ...(isAdmin ? [{ to: '/user-management', label: 'Users', icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-2 mt-6">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;

                    return (
                      <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant={isActive ? 'secondary' : 'ghost'}
                          className="w-full justify-start flex items-center space-x-2"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full justify-start flex items-center space-x-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

            <h1 className="text-base sm:text-lg md:text-xl font-bold whitespace-nowrap">Resource Dashboard</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0 flex-1 ml-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <Link key={item.to} to={item.to} className="flex-shrink-0">
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-1 whitespace-nowrap px-3 py-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarFallback>{avatarLetter}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{userName}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="w-full px-4 py-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
