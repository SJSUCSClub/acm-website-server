import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';

import Logo from '../../../Logo.png';

import LinkCard from '../../atoms/link-card';
import Btn from '../../atoms/btn';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage } from '@/components/atoms/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path: string) => {
    navigate({ to: path });
  };

  return (
    <div className="navbar z-10 sticky w-full">
      <div className="flex bg-white px-[5%] py-4 border-b-4 w-full">
        <a href="/" className="mr-auto">
          <img src={Logo} alt="Logo" className="sm:h-auto max-w-[100px] h-auto" />
        </a>

        <div className="sm:hidden md:flex grid grid-flow-col gap-4 items-center text-right justify-right">
          <LinkCard path="/about" pathName="About Us" />
          <LinkCard path="/events" pathName="Events" />
          <LinkCard path="/projects" pathName="Projects" />

          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="flex items-center space-x-2">
                  <p>{user.name}</p>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleNavigation('/dashboard')}>
                  Dashboard
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavigation('/admin')}>
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LinkCard path="/login" pathName="Log In" />
          )}
        </div>

        <div className="md:hidden place-content-center items-center">
          <Btn
            variant="tertiary"
            onClick={handleClick}
            className="flex flex-col justify-center items-center gap-0"
          >
            <span
              className={`bg-black block transition-all duration-300 ease-out 
                              h-1 w-9 rounded-sm ${isOpen ? 'rotate-45 translate-y-2' : '-translate-y-0.5'
                }`}
            ></span>
            <span
              className={`bg-black block transition-all duration-300 ease-out 
                              h-1 w-9 rounded-sm my-1 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
            ></span>
            <span
              className={`bg-black block transition-all duration-300 ease-out 
                              h-1 w-9 rounded-sm ${isOpen ? '-rotate-45 -translate-y-2' : 'translate-y-0.5'
                }`}
            ></span>
          </Btn>
        </div>
      </div>
      <div
        className={`w-screen ${isOpen
            ? 'absolute transition ease-in flex-row bg-white justify-center text-center items-center md:hidden border-b-4'
            : 'hidden'
          }`}
        onClick={handleClick}
      >
        <LinkCard path="/about" pathName="About Us" />
        <LinkCard path="/events" pathName="Events" />
        <LinkCard path="/projects" pathName="Projects" />

        {isLoggedIn ? (
          <div className="flex flex-col w-full">
            <Link
              to="/dashboard"
              className="flex items-center justify-center p-4 hover:bg-gray-100 transition-colors w-full text-center"
              title="Dashboard"
            >
              <span>Dashboard</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center justify-center p-4 hover:bg-gray-100 transition-colors w-full text-center"
                title="Admin"
              >
                <span>Admin Panel</span>
              </Link>
            )}

            <button
              onClick={() => logout()}
              className="flex items-center justify-center p-4 hover:bg-gray-100 transition-colors text-red-600 w-full text-center"
            >
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <LinkCard path="/login" pathName="Log In" />
        )}
      </div>
    </div>
  );
};
