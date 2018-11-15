import routes from '../../routes';
import { floatToDollar } from '../../utils/dollarTools';
import { dateToMDY } from '../../utils/dateTools';
import yabaAxios from '../../utils/yabaAxios';
import { ERROR, addAlert, serverErrorCheck } from './alerts';
import { attachTagToTransaction } from './tags';

// Fetching transactions

export const DEFAULT_FETCH_LIMIT = 20;

export const REQUEST_TRANSACTIONS = 'REQUEST_TRANSACTIONS';
export const requestTransactions = () => ({
  type: REQUEST_TRANSACTIONS,
});

export const RECEIVE_TRANSACTIONS = 'RECEIVE_TRANSACTIONS';
export const receiveTransactions = response => ({
  type: RECEIVE_TRANSACTIONS,
  transactions: {
    count: response.count,
    totalAmount: floatToDollar(response.total_amount),
    items: response.transactions.map(transaction => ({
      amount: floatToDollar(transaction.value),
      description: transaction.description,
      date: dateToMDY(transaction.date),
      id: transaction.id,
      tags: transaction.tags,
    })),
  },
});

export const REPORT_NO_TRANSACTIONS = 'REPORT_NO_TRANSACTIONS';
export const reportNoTransactions = () => ({
  type: REPORT_NO_TRANSACTIONS,
});

export const fetchTransactions = (params={}) => dispatch => {
  dispatch(requestTransactions());

  return yabaAxios.get(routes.transactions, {
    params: {
      limit: params.limit,
      page: params.page,
      tag_names: params.tagNames,
      from_date: params.fromDate,
      to_date: params.toDate,
      description: params.description,
      match_all_tags: params.matchAllTags,
      sort_attribute: params.category,
      sort_order: params.order,
    },
  }).then(response => {
    dispatch(receiveTransactions(response.data.content));
  }).catch(err => {
    if (params.page === 0 && err.response.status === 400) {
      dispatch(reportNoTransactions());
    } else {
      dispatch(addAlert({
        type: ERROR,
        message: 'There was an error while trying to fetch your transactions. Please try again later.',
      }));
    }

    serverErrorCheck(err, dispatch);
  });
};

// Adding transactions

export const TOGGLE_TRANS_FORM = 'TOGGLE_TRANS_FORM';
export const toggleTransactionForm = () => ({
  type: TOGGLE_TRANS_FORM,
});

export const REQUEST_TO_ADD_TRANSACTION = 'REQUEST_TO_ADD_TRANSACTION';
export const requestAddTransaction = () => ({
  type: REQUEST_TO_ADD_TRANSACTION,
});

export const PUSH_NEW_TRANSACTION = 'PUSH_NEW_TRANSACTION';
export const addTransaction = transaction => ({
  type: PUSH_NEW_TRANSACTION,
  transaction: {
    amount: floatToDollar(transaction.value),
    description: transaction.description,
    date: dateToMDY(transaction.date),
    id: transaction.id,
  },
});

export const createTransaction = (data={}) => dispatch => {
  dispatch(requestAddTransaction());

  return yabaAxios.post(routes.transactions, {
    date: data.date,
    description: data.description,
    value: data.amount,
  }).then(response => {
    dispatch(addTransaction(response.data.content));
    if (data.tags) {
      data.tags.map(tag => {
        dispatch(attachTagToTransaction({
          tagName: tag,
          transactionId: response.data.content.id,
        }));
      });
    }
  }).catch(err => {
    if (err.response.status >= 400) {
      dispatch(addAlert({
        type: ERROR,
        message: 'There was an error while trying to create a transaction. Please check your inputs and try again.',
      }));
    }
    serverErrorCheck(err, dispatch);
  });
};

// Updating transactions

export const REQUEST_TO_UPDATE_TRANSACTION = 'REQUEST_TO_UPDATE_TRANSACTION';
export const requestUpdateTransaction = () => ({
  type: REQUEST_TO_UPDATE_TRANSACTION,
});

export const EDIT_TRANSACTION = 'EDIT_TRANSACTION';
export const editTransaction = transaction => ({
  type: EDIT_TRANSACTION,
  transaction: {
    amount: floatToDollar(transaction.value),
    date: dateToMDY(transaction.date),
    description: transaction.description,
    id: transaction.id,
  },
});

export const updateTransaction = (data={}) => dispatch => {
  dispatch(requestUpdateTransaction());

  return yabaAxios.post(routes.updateTransaction, {
    date: data.date,
    description: data.description,
    id: data.id,
    value: data.amount,
  }).then(response => {
    dispatch(editTransaction(response.data.content));
  }).catch(err => {
    if (err.response.status >= 400) {
      const message = err.response.status === 404 ?
        'We could not find the transaction you were trying to update.' :
        'There was an error while trying to update your transaction. Please check your inputs and try again.';

      dispatch(addAlert({
        type: ERROR,
        message,
      }));
    }
    serverErrorCheck(err, dispatch);
  });
};

// Deleting transactions

export const REQUEST_TO_DELETE_TRANSACTION = 'REQUEST_TO_DELETE_TRANSACTION';
export const requestDeleteTransaction = () => ({
  type: REQUEST_TO_DELETE_TRANSACTION,
});

export const REMOVE_DELETED_TRANSACTION = 'REMOVE_DELETED_TRANSACTION';
export const removeDeletedTransaction = transaction => ({
  type: REMOVE_DELETED_TRANSACTION,
  transaction: {
    id: transaction.id,
  },
});

export const deleteTransaction = id => dispatch => {
  dispatch(requestDeleteTransaction());

  return yabaAxios.post(routes.deleteTransaction, { id })
    .then(response => {
      dispatch(removeDeletedTransaction(response.data.content));
    }).catch(err => {
      if (err.response.status >= 404) {
        dispatch(addAlert({
          type: ERROR,
          message: 'It looks like the transaction you are trying to delete does not exist. Please refresh the page.',
        }));
      }
      serverErrorCheck(err, dispatch);
    });
};

// Clearing transactions from store
// (Not deleting them from the database)

export const CLEAR_TRANSACTIONS = 'CLEAR_TRANSACTIONS';
export const clearTransactions = () => ({
  type: CLEAR_TRANSACTIONS,
});
