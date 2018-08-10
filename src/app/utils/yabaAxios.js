import axios from 'axios';

const yabaAxios = axios.create();

yabaAxios.defaults.headers.common['access-token'] = localStorage['access-token'];
yabaAxios.defaults.headers.common.client = localStorage.client;
yabaAxios.defaults.headers.common.expiry = localStorage['expiry'];
yabaAxios.defaults.headers.common['token-type'] = localStorage['token-type'];
yabaAxios.defaults.headers.common.uid = localStorage.uid;

export default yabaAxios;
