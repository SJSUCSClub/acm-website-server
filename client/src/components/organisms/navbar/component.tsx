import React, { useState } from "react";

import Logo from "../../../Logo.png";

import LinkCard from "../../atoms/link-card";
import Btn from "../../atoms/btn";

export const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className="navbar z-10 sticky w-full">
      <div className="flex bg-white px-[5%] py-4 border-b-4 w-full">
        <a href="/" className="mr-auto">
          <img
            src={Logo}
            alt="Logo"
            className="sm:h-auto max-w-[100px] h-auto"
          />
        </a>

        <div className="md:flex grid grid-flow-col gap-4 items-center text-right justify-right">
          <LinkCard path="/about" pathName="About Us" />
          <LinkCard path="/events" pathName="Events" />
          <LinkCard path="/login" pathName="Log In" />
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
                                isOpen
                                  ? "rotate-45 translate-y-2"
                                  : "-translate-y-0.5"
                              }`}
            ></span>
            <span
              className={`bg-black block transition-all duration-300 ease-out 
                              h-1 w-9 rounded-sm my-1 ${
                                isOpen ? "opacity-0" : "opacity-100"
                              }`}
            ></span>
            <span
              className={`bg-black block transition-all duration-300 ease-out 
                              h-1 w-9 rounded-sm ${
                                isOpen
                                  ? "-rotate-45 -translate-y-2"
                                  : "translate-y-0.5"
                              }`}
            ></span>
          </Btn>
        </div>
      </div>
      <div
        className={`w-screen ${
          isOpen
            ? "absolute transition ease-in flex-row bg-white justify-center text-center items-center md:hidden  border-b-4"
            : "hidden"
        }`}
        onClick={handleClick}
      >
        <LinkCard path="/about" pathName="About Us" />
        <LinkCard path="/events" pathName="Events" />
      </div>
    </div>
  );
};
