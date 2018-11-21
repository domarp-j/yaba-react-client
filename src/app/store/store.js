import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { reduxTokenAuthReducer } from 'redux-token-auth';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import alertsReducer from './reducers/alerts';
import transactionsReducer from './reducers/transactions';
import { SORT_CATEGORIES, SORT_ORDERS } from './actions/sorting';


const initialState = {
  alerts: [],
  reduxTokenAuth: {
    currentUser: {
      isLoading: false,
      isSignedIn: false,
      attributes: {},
    },
  },
  transactions: {
    items: [],
    count: 0,
    totalAmount: '',
    boolEvents: {
      allTransactionsFetched: false,
      isAddingTransaction: false,
      isEditingTransaction: false,
      isFetchingTags: false,
      isFetchingTransactions: false,
      isDeletingTransaction: false,
      noTransactionsFound: false,
      queryPresent: false,
      toggleTransactionForm: false,
    },
    queries: {
      description: '',
      fromDate: '',
      matchAllTags: true,
      tagNames: [],
      toDate: '',
    },
    sorting: {
      category: SORT_CATEGORIES.date,
      order: SORT_ORDERS.desc,
    },
    tags: [],
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
