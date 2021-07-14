const awsConfig = {
  Auth: {
    identityPoolId: process.env.REACT_APP_SSO_COGNITO_IDENTITY_POOL_ID,
    region: process.env.REACT_APP_SSO_AWS_PROJECT_REGION,
    userPoolId: process.env.REACT_APP_SSO_USER_POOLS_ID,
    userPoolWebClientId: process.env.REACT_APP_SSO_USER_POOLS_WEB_CLIENT_ID,
  },
};

export default awsConfig;
