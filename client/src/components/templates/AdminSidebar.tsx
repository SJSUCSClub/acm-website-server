import React, { useState } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  House,
  Users,
  FolderOpenDot,
  Calendar,
  ShieldUser,
  Building,
  List
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import Page from '@/components/templates/Page';
import { Link } from '@tanstack/react-router';

interface IAdminSidebarProps {
  children: React.ReactNode;
}

const AdminSidebar: React.FC<IAdminSidebarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navItems = [
    {
      title: 'Home',
      icon: House,
      href: '/admin'
    },
    {
      title: 'Club',
      icon: List,
      href: '/admin/club'
    },
    {
      title: 'Users',
      icon: Users,
      href: '/admin/users'
    },
    {
      title: 'Projects',
      icon: FolderOpenDot,
      href: '/admin/projects'
    },
    {
      title: 'Events',
      icon: Calendar,
      href: '/admin/events'
    },
    {
      title: 'Companies',
      icon: Building,
      href: '/admin/companies'
    },
    {
      title: 'Officers',
      icon: ShieldUser,
      href: '/admin/officers'
    }
  ];
  return (
    <div className="flex flex-col md:flex-row w-full min-h-[calc(100vh-4rem)]">
      <div
        className={clsx(
          'relative flex flex-row md:flex-col border-b md:border-b-0 md:border-r bg-background transition-all duration-300',
          collapsed ? 'w-full md:w-16' : 'w-full md:w-44'
        )}
      >
        <div className="hidden md:flex items-center border-r md:border-r-0 md:border-b px-2 md:px-4 h-12 md:h-14">
          {!collapsed && <h2 className="hidden md:block">Admin</h2>}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden md:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>

        <div className="flex-1 w-full">
          <nav className="grid grid-cols-7 md:grid-cols-none md:grid-flow-row md:gap-1 w-full">
            {navItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={clsx(
                  'flex items-center py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  'justify-center md:justify-center',
                  'md:h-12 md:px-3 md:rounded-md',
                  !collapsed && 'md:justify-start'
                )}
              >
                <div className={clsx('flex items-center', !collapsed && 'md:w-full')}>
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="hidden md:block ml-3">{item.title}</span>}
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="flex-grow w-full overflow-auto">
        <Page>{children}</Page>
      </div>
    </div>
  );
};

export default AdminSidebar;
