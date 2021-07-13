import React from 'react';
import { useMsal } from '@azure/msal-react';

const SignInButton = () => {
  const { instance } = useMsal();

  const handleLogin = async (loginType) => {
    if (loginType === 'popup') {
      try {
        await instance.loginPopup();
      } catch (error) {
        console.log(`catched error: ${error}`);
      }
    } else if (loginType === 'redirect') {
      try {
        await instance.loginRedirect();
      } catch (error) {
        console.log(`catched error: ${error}`);
      }
    }
  };

  return (
    <div role="button" tabIndex={0} onClick={() => handleLogin('popup')} onKeyDown={() => handleLogin('popup')} style={{ border: '1px solid green', cursor: 'pointer' }}>
      Sign In
    </div>
  );
};

export default SignInButton;
