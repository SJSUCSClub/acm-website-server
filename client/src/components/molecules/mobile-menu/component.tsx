import Btn from "../../../components/atoms/btn";
import React, { useState } from "react";

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <Btn
        variant="tertiary"
        onClick={handleClick}
        className="flex flex-col justify-center items-center"
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
      <div>About Us Events</div>
    </div>
  );
};
