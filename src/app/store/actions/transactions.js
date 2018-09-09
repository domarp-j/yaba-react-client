import routes from '../../routes';
import { floatToDollar } from '../../utils/dollarTools';
import { dateToMDY } from '../../utils/dateTools';
import yabaAxios from '../../utils/yabaAxios';

// Fetching transactions

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
    },
  }).then(response => {
    dispatch(receiveTransactions(response.data.content));
  });
};

// Adding transactions

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
  }).then(response => { dispatch(addTransaction(response.data.content)); });
};

// Updating transactions

export const TOGGLE_EDIT_STATE = 'TOGGLE_EDIT_STATE';
export const toggleEditState = (transaction, editMode) => ({
  type: TOGGLE_EDIT_STATE,
  transaction,
  editMode,
});

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
  }).then(response => { dispatch(editTransaction(response.data.content)); });
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
    .then(response => { dispatch(removeDeletedTransaction(response.data.content)); });
};

// Clearing transactions from store
// (Not deleting them from the database)

export const CLEAR_TRANSACTIONS = 'CLEAR_TRANSACTIONS';
export const clearTransactions = () => ({
  type: CLEAR_TRANSACTIONS,
});
