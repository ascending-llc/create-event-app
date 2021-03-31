export const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_SSO_CLIENT_ID,
        authority: 'https://login.microsoftonline.com/' + process.env.REACT_APP_SSO_TENANT_ID,
        redirectUri: 'http://localhost:3000'
    },
    cache: {
        cacheLocation: "sessionStorage", // This configures where your cache will be stored
        storeAuthStateInCookie: false // Set this to "true" if you are having issues on IE11 or Edge
    },
};

