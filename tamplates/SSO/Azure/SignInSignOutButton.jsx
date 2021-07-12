import React from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import SignInButton from './SignInButton';
import SignOutButton from './SignOutButton';

const SignInSignOutButton = () => {
  const isAuthenticated = useIsAuthenticated();

  return (isAuthenticated) ? <SignOutButton /> : <SignInButton />;
};

export default SignInSignOutButton;
