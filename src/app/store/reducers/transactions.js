import { filter, findIndex, update } from 'ramda';
import {
  REQUEST_TRANSACTIONS,
  RECEIVE_TRANSACTIONS,
  REQUEST_TO_ADD_TRANSACTION,
  PUSH_NEW_TRANSACTION,
  TOGGLE_EDIT_STATE,
  REQUEST_TO_UPDATE_TRANSACTION,
  EDIT_TRANSACTION,
  REQUEST_TO_DELETE_TRANSACTION,
  REMOVE_DELETED_TRANSACTION,
  CLEAR_TRANSACTIONS
} from '../actions/transactions';

import {
  REQUEST_ADD_TRANSACTION_TAG,
  ADD_TRANSACTION_TAG,
  REQUEST_UPDATE_TRANSACTION_TAG,
  UPDATE_TRANSACTION_TAG,
  REQUEST_REMOVE_TRANSACTION_TAG,
  REMOVE_TRANSACTION_TAG
} from '../actions/transactionTags';

const transactions = (
  state = {},
  action
) => {
  switch (action.type) {
  // Fetching transactions
  case REQUEST_TRANSACTIONS:
    return {
      ...state,
      isFetching: true,
    };
  case RECEIVE_TRANSACTIONS:
    return {
      ...state,
      allTransactionsFetched: action.transactions.length === 0,
      isFetching: false,
      items: [...state.items, ...action.transactions],
    };
  // Adding transactions
  case REQUEST_TO_ADD_TRANSACTION:
    return {
      ...state,
      isAdding: true,
    };
  case PUSH_NEW_TRANSACTION:
    return {
      ...state,
      isAdding: false,
      items: [{ ...action.transaction, justAdded: true }, ...state.items],
    };
  // Editing transactions
  case TOGGLE_EDIT_STATE:
    return {
      ...state,
      items: update(
        findIndex(item => item.id === action.transaction.id)(state.items),
        { ...action.transaction, editMode: action.editMode },
        state.items
      ),
    };
  case REQUEST_TO_UPDATE_TRANSACTION:
    return {
      ...state,
      isEditing: true,
    };
  case EDIT_TRANSACTION:
    return {
      ...state,
      isEditing: false,
      items: state.items.map(item => {
        if (item.id !== action.transaction.id) return item;
        return { ...action.transaction, tags: item.tags };
      }),
    };
  // Deleting transactions
  case REQUEST_TO_DELETE_TRANSACTION:
    return {
      ...state,
      isDeleting: true,
    };
  case REMOVE_DELETED_TRANSACTION:
    return {
      ...state,
      isDeleting: false,
      items: filter(item => item.id !== action.transaction.id, [...state.items]),
    };
  // Clearing transactions from store
  case CLEAR_TRANSACTIONS:
    return {
      ...state,
      isFetching: false,
      items: [],
    };
  // Adding tags to transactions
  case REQUEST_ADD_TRANSACTION_TAG:
    return {
      ...state,
      isAddingTag: true,
    };
  case ADD_TRANSACTION_TAG:
    return {
      ...state,
      isAddingTag: false,
      items: state.items.map(item => {
        if (item.id !== action.transaction.id) return item;
        return { ...item, tags: [...item.tags, action.tag] };
      }),
    };
  // Updating tags for transactions
  case REQUEST_UPDATE_TRANSACTION_TAG:
    return {
      ...state,
      isUpdatingTag: true,
    };
  case UPDATE_TRANSACTION_TAG:
    return {
      ...state,
      isUpdatingTag: false,
      items: state.items.map(item => {
        if (item.id !== action.transaction.id) return item;
        return {
          ...item,
          tags: update(
            findIndex(tag => tag.id === action.tag.id)(item.tags),
            action.tag,
            item.tags
          ),
        };
      }),
    };
  // Removing tags from transactions
  case REQUEST_REMOVE_TRANSACTION_TAG:
    return {
      ...state,
      isRemovingTag: true,
    };
  case REMOVE_TRANSACTION_TAG:
    return {
      ...state,
      isRemovingTag: false,
      items: state.items.map(item => {
        if (item.id !== action.transaction.id) return item;
        return {
          ...item,
          tags: filter(tag => (
            tag.id !== action.tag.id && tag.name !== action.tag.name
          ), [...item.tags]),
        };
      }),
    };
  // Fallthrough behavior
  default:
    return state;
  }
};

export default transactions;
