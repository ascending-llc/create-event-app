import { React, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useIsAuthenticated } from '@azure/msal-react';

const AuthGuard = (props) => {
  const { children, defaultComponent } = props;
  const isAuthenticated = useIsAuthenticated();

  const history = useHistory();
  const location = useLocation();
  const [requestedLocation, setRequestedLocation] = useState(null);

  // TODO test 2hr token expired
  if (!isAuthenticated) {
    if (location.pathname !== requestedLocation) {
      setRequestedLocation(location.pathname);
    }

    return defaultComponent;
  }

  // This is done so that in case the route changes by any chance through other
  // means between the moment of request and the render we navigate to the initially
  // requested route.
  if (requestedLocation && location.pathname !== requestedLocation) {
    setRequestedLocation(null);
    history.push(requestedLocation);
    // return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
};

AuthGuard.propTypes = {
  children: PropTypes.node,
  defaultComponent: PropTypes.element,
};

AuthGuard.defaultProps = {
  children: null,
  defaultComponent: null,
};

export default AuthGuard;
