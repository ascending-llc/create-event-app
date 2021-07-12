import { LogLevel } from '@azure/msal-browser';

const ua = window.navigator.userAgent;
const msie = ua.indexOf('MSIE ');
const msie11 = ua.indexOf('Trident/');
const msedge = ua.indexOf('Edge/');
const firefox = ua.indexOf('Firefox');
const isIE = msie > 0 || msie11 > 0;
const isEdge = msedge > 0;
const isFirefox = firefox > 0;

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_SSO_CLIENT_ID,
    authority: `${process.env.REACT_APP_SSO_CLOUD_ID}/${process.env.REACT_APP_SSO_TENANT_ID}`,
    redirectUri: process.env.REACT_APP_SSO_ACTIVE_DIRECTORY_REDIRECT_URL,
    postLogoutRedirectUri: process.env.REACT_APP_SSO_POST_LOGOUT_REDIRECT_URL,
  },
  cache: {
    storeAuthStateInCookie: isIE || isEdge || isFirefox,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            break;
          default:
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ['User.Read'],
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft-ppe.com/v1.0/me',
};
