import React, { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, House, Users, FolderOpenDot, Calendar, ShieldUser, Building, List } from 'lucide-react';
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
    <div className="flex h-[800px]">
      <div
        className={clsx(
          'relative flex flex-col border-r bg-background transition-all duration-300',
          collapsed ? 'w-16' : 'w-44'
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          {!collapsed && <h2>Admin</h2>}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  collapsed ? 'justify-center' : ''
                )}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <Page>{children}</Page>
    </div>
  );
};

export default AdminSidebar;
