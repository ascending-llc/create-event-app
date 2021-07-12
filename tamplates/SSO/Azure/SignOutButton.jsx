import React from 'react';
import { useMsal } from '@azure/msal-react';
import { useHistory } from 'react-router-dom';

const SignOutButton = () => {
  const { instance } = useMsal();
  const history = useHistory();

  const handleLogout = (logoutType) => {
    if (logoutType === 'popup') {
      instance.logoutPopup();
      history.push('/');
    } else if (logoutType === 'redirect') {
      instance.logoutRedirect();
    }
  };

  return (
    <div role="button" tabIndex={0} onClick={() => handleLogout('popup')} onKeyDown={() => handleLogout('popup')} style={{ border: '1px solid red', cursor: 'pointer' }}>
      Sign Out
    </div>
  );
};

export default SignOutButton;
