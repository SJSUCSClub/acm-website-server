import React from "react";
import { Btn } from "../../atoms/btn/component";
import GoogleLogo from "/icons/google.png";

export const GoogleLogInBtn: React.FC = () => {
  const handleGoogleLogin = () => {
    // Implement Google login logic here
    console.log("Google login initiated");
  };

  return (
    <div className="flex justify-center mt-4">
      <Btn
        variant="ghost"
        onClick={handleGoogleLogin}
        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-md transition-all duration-200 ease-in-out"
      >
        <img src={GoogleLogo} alt="google logo" className="w-6 h-6" />
        Log in with Google
      </Btn>
    </div>
  );
};
