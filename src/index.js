import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { store, persistor } from './app/store/store';
import { verifyCredentials } from './app/store/actions/reduxTokenAuth';
import 'semantic-ui-css/semantic.min.css';

verifyCredentials(store);

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
