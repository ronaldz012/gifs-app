export const environment = {
  BACKEND_URL: '$BACKEND_URL',
  tenant: 'client1',
  auth0: {
    domain: '$AUTH0_DOMAIN',
    clientId: '$AUTH0_CLIENT_ID',
    authorizationParams: {
      redirect_uri: `${window.location.origin}/dashboard`,
      audience: '$BACKEND_URL',
    },
  },
};
