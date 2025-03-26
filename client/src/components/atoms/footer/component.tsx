import React from 'react';
import Logo from '../../../Logo.png';

interface FooterProps {
  layout?: 'row' | 'column';
}

export const Footer: React.FC<FooterProps> = ({ layout = 'column' }) => (
  <footer
    className={`flex flex-col ${layout === 'row' ? '' : 'md:flex-row'} gap-y-4 justify-between items-center bg-white text-gray-400 text-center w-full p-5 relative`}
  >
    <img src={Logo} alt="Logo" width={100} className="sm:h-auto" />

    <div className="text-center place-content-center max-w-full md:max-w-[50%]">
      <p className="text-center text-sm">
        ROOM MQH 227, SAN JOSE STATE UNIVERSITY 1 WASHINGTON SQ, SAN JOSE, CA 95192
      </p>
      <p className="text-center pt-2 text-sm">ACM-CS AT SJSU &#169; 2024</p>
    </div>

    <div className={`flex flex-row gap-x-4`}>
      <a href="https://discord.gg/4cXE636ax4" target="blank">
        <img width={33} height={33} src="/icons/discord.svg" alt="discord image" />
      </a>
      <a href="https://www.instagram.com/sjsuacm/" target="blank">
        <img width={33} height={33} src="/icons/Instagram.svg" alt="instagram image" />
      </a>
      <a href="https://www.linkedin.com/company/sjsu-computer-science-club/about/" target="blank">
        <img width={33} height={33} src="/icons/logo2.svg" alt="linkedin image" />
      </a>
    </div>
  </footer>
);
