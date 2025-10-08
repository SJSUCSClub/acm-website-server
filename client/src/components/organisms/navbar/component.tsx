import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';

import Logo from '../../../Logo.png';

import LinkCard from '../../atoms/link-card';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { SearchBar } from '@/components/molecules/search-bar';
import { DEFAULT_EVENT_FILTERS } from '@/utils/constants';

export const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isLoggedIn, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path: string) => {
    navigate({ to: path });
  };

  return (
    <div className="navbar z-10 sticky border-b-4 w-full">
      <div className="flex max-w-7xl mx-auto items-center justify-between bg-white px-2 md:px-6 py-4 w-full">
        <Link to="/">
          <img src={Logo} alt="Logo" className="sm:h-auto max-w-[100px] h-auto" />
        </Link>

        <div className="sm:w-[400px] sm:block hidden xl:w-[500px]">
          <SearchBar />
        </div>

        {/* Desktop Navigation - Only visible on screens >= 1024px (lg) */}
        <div className="hidden lg:flex items-center gap-2">
          <LinkCard to="/about" pathName="About Us" />
          <LinkCard to="/events" search={DEFAULT_EVENT_FILTERS} pathName="Events" />
          <LinkCard to="/companies" pathName="Companies" />
          <LinkCard to="/projects" pathName="Projects" />

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
                <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                  Profile
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
            <LinkCard to="/login" pathName="Log In" />
          )}
        </div>

        {/* Mobile Menu Button - Only visible on screens < 1024px */}
        {isMobile && (
          <button
            onClick={handleClick}
            aria-label="Toggle mobile menu"
            className="flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
          >
            <div className="w-6 flex flex-col items-center justify-center space-y-1.5">
              <span
                className={`bg-black block w-full h-0.5 rounded-sm transition-all duration-300 ease-out ${
                  isOpen ? 'transform rotate-45 translate-y-2' : ''
                }`}
              ></span>
              <span
                className={`bg-black block w-full h-0.5 rounded-sm transition-all duration-300 ease-out ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`}
              ></span>
              <span
                className={`bg-black block w-full h-0.5 rounded-sm transition-all duration-300 ease-out ${
                  isOpen ? 'transform -rotate-45 -translate-y-2' : ''
                }`}
              ></span>
            </div>
          </button>
        )}
      </div>

      {/* Mobile Menu - Only visible on screens < 1024px */}
      <div
        className={`fixed top-[69px] left-0 right-0 bg-white border-b-4 shadow-lg transition-all duration-300 ease-in-out lg:hidden z-50 ${
          isOpen
            ? 'flex flex-col max-h-[calc(100vh-69px)] opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden border-b-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col w-full">
          <Link
            to="/about"
            className="flex items-center px-6 py-4 hover:bg-gray-100 transition-colors w-full"
            onClick={handleClick}
          >
            <span className="text-[#196096] font-semibold">About Us</span>
          </Link>

          <Link
            to="/events"
            search={{ ...DEFAULT_EVENT_FILTERS }}
            className="flex items-center px-6 py-4 hover:bg-gray-100 transition-colors w-full"
            onClick={handleClick}
          >
            <span className="text-[#196096] font-semibold">Events</span>
          </Link>

          <Link
            to="/companies"
            className="flex items-center px-6 py-4 hover:bg-gray-100 transition-colors w-full"
            onClick={handleClick}
          >
            <span className="text-[#196096] font-semibold">Companies</span>
          </Link>

          <Link
            to="/projects"
            className="flex items-center px-6 py-4 hover:bg-gray-100 transition-colors w-full"
            onClick={handleClick}
          >
            <span className="text-[#196096] font-semibold">Projects</span>
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center px-6 py-4 hover:bg-gray-100 transition-colors w-full"
                onClick={handleClick}
              >
                <span className="text-[#196096] font-semibold">Dashboard</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-6 py-4 hover:bg-gray-100 transition-colors w-full"
                onClick={handleClick}
              >
                <span className="text-[#196096] font-semibold">Profile</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center px-6 py-4 hover:bg-gray-100 transition-colors w-full"
                  onClick={handleClick}
                >
                  <span className="text-[#196096] font-semibold">Admin Panel</span>
                </Link>
              )}

              <button
                onClick={() => {
                  logout();
                  handleClick();
                }}
                className="flex items-center px-6 py-4 hover:bg-gray-100 transition-colors w-full text-left"
              >
                <span className="text-red-600 font-semibold">Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center px-6 py-4 hover:bg-gray-100 transition-colors w-full"
              onClick={handleClick}
            >
              <span className="text-[#196096] font-semibold">Log In</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
