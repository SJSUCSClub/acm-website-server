import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';

import Logo from '../../../Logo.png';

import LinkCard from '../../atoms/link-card';
import Btn from '../../atoms/btn';
import { useAuth } from '@/hooks/useAuth';

export const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isLoggedIn, user, isAdmin, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

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

          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="User"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <svg
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                  <Link
                    to="/dashboard"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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
                              h-1 w-9 rounded-sm ${
                                isOpen ? 'rotate-45 translate-y-2' : '-translate-y-0.5'
                              }`}
            ></span>
            <span
              className={`bg-black block transition-all duration-300 ease-out 
                              h-1 w-9 rounded-sm my-1 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
            ></span>
            <span
              className={`bg-black block transition-all duration-300 ease-out 
                              h-1 w-9 rounded-sm ${
                                isOpen ? '-rotate-45 -translate-y-2' : 'translate-y-0.5'
                              }`}
            ></span>
          </Btn>
        </div>
      </div>
      <div
        className={`w-screen ${
          isOpen
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
