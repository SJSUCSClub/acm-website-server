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
  const [collapsed, setCollapsed] = useState(true);
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
        <div className="flex items-center border-r md:border-r-0 md:border-b px-4 h-12 md:h-14">
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

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid grid-flow-col md:grid-flow-row gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  'justify-center md:justify-start'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="hidden md:inline md:block">{!collapsed && item.title}</span>
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
