import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import WebFont from 'webfontloader';

import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { store, persistor } from './app/store/store';
import { verifyCredentials } from './app/store/actions/reduxTokenAuth';

import 'semantic-ui-css/semantic.min.css';
import './styles/css/index.css';

verifyCredentials(store);

WebFont.load({
  google: {
    families: [
      'Abel',
      'Playfair Display',
      'Source Serif Pro',
    ],
  },
});

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={undefined} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
