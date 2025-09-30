import React from 'react';
import { Btn } from '@/components/atoms/btn/component';
import GoogleLogo from '/icons/google.png';

export const GoogleLogInBtn: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = '/api/v1/auth/login';
  };

  return (
    <Btn variant="outline" onClick={handleGoogleLogin} className="w-full p-4">
      <img src={GoogleLogo} alt="google logo" className="w-6 h-6" />
      Log in with Google
    </Btn>
  );
};
