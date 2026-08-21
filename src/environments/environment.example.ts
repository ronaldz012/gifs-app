export const environment = {
  BACKEND_URL: 'http://localhost:5253',
  tenant: 'client1',
  auth0: {
    domain: 'dev-1lyf0fvp3apjejc8.us.auth0.com',
    clientId: 'kGenrfzeyzRYl9oLS1vH0IKiDYLomGUQ',
    authorizationParams: {
      redirect_uri: `${window.location.origin}/dashboard`,
      audience: 'https://mi-api',
    },
  },
};
