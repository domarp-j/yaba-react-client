import axios from 'axios';

const yabaAxios = axios.create();

// Set required headers for devise token authentication
// Export as a function so that headers can be imperatively activated elsewhere
// Particularly useful when signing in or signing up, which sets headers as needed
export const configureAxios = () => {
  return new Promise(resolve => {
    yabaAxios.defaults.headers.common['access-token'] = localStorage['access-token'];
    yabaAxios.defaults.headers.common.client = localStorage.client;
    yabaAxios.defaults.headers.common.expiry = localStorage['expiry'];
    yabaAxios.defaults.headers.common['token-type'] = localStorage['token-type'];
    yabaAxios.defaults.headers.common.uid = localStorage.uid;

    resolve();
  });
};

// Run on app initialization just in case localStorage values are already set
configureAxios();

export default yabaAxios;
