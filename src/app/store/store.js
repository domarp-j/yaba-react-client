import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { reduxTokenAuthReducer } from 'redux-token-auth';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import alertsReducer from './reducers/alerts';
import transactionsReducer from './reducers/transactions';

const initialState = {
  alerts: [],
  reduxTokenAuth: {
    currentUser: {
      isLoading: false,
      isSignedIn: false,
      attributes: {
        username: undefined,
      },
    },
  },
  transactions: {
    items: [],
    count: 0,
    totalAmount: '',
    events: {
      allTransactionsFetched: false,
      isAdding: false,
      isEditing: false,
      isFetching: false,
      isDeleting: false,
      noTransactionsFound: false,
    },
    queries: {
      description: undefined,
      fromDate: '',
      matchAllTags: true,
      tagNames: [],
      toDate: '',
    },
  },
};

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [
    'alerts',
  ],
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    alerts: alertsReducer,
    reduxTokenAuth: reduxTokenAuthReducer,
    transactions: transactionsReducer,
  })
);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const logger = createLogger();

const yabaStore = createStore(
  persistedReducer,
  initialState,
  composeEnhancers(applyMiddleware(thunk, logger))
);

const persistor = persistStore(yabaStore);

export { yabaStore as store, persistor, initialState };
