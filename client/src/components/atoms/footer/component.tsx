import React from 'react';
import Logo from '../../../Logo.png';
import { useQuery } from '@/hooks/useFetch';

interface FooterProps {
  layout?: 'row' | 'column';
}

export const Footer: React.FC<FooterProps> = ({ layout = 'column' }) => {
  const { data } = useQuery('get', '/v1/club/links');
  return (
    <footer
      className={`flex flex-col ${layout === 'row' ? '' : 'md:flex-row'} gap-y-4 justify-between items-center bg-white text-gray-400 text-center bottom-0 max-w-full place-content-center p-5 `}
    >
      <img src={Logo} alt="Logo" width={100} className="sm:h-auto" />

      <div className="text-center place-content-center max-w-[50%]">
        <p className="text-center text-sm">
          ROOM MQH 227, SAN JOSE STATE UNIVERSITY 1 WASHINGTON SQ, SAN JOSE, CA 95192
        </p>
        <p className="text-center pt-2 text-sm">ACM-CS AT SJSU &#169; 2024</p>
      </div>
      {data && (
        <div className={`flex flex-row gap-x-4`}>
          {data.links.discord && (
            <a href={data.links.discord} target="blank">
              <img width={33} height={33} src="/icons/discord.svg" alt="discord image" />
            </a>
          )}
          {data.links.instagram && (
            <a href={data.links.instagram} target="blank">
              <img width={33} height={33} src="/icons/Instagram.svg" alt="instagram image" />
            </a>
          )}
          {data.links.linkedin && (
            <a href={data.links.linkedin} target="blank">
              <img width={33} height={33} src="/icons/logo2.svg" alt="linkedin image" />
            </a>
          )}
        </div>
      )}
    </footer>
  );
};
