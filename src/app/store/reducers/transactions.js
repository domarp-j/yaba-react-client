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
  REQUEST_TO_ADD_TAG_TO_TRANSACTION,
  ADD_TAG_TO_TRANSACTION,
  REQUEST_TO_REMOVE_TAG_FROM_TRANSACTION,
  REMOVE_TAG_FROM_TRANSACTION
} from '../actions/tags';

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
  case REQUEST_TO_ADD_TAG_TO_TRANSACTION:
    return {
      ...state,
      isAddingTag: true,
    };
  case ADD_TAG_TO_TRANSACTION:
    return {
      ...state,
      isAddingTag: false,
      items: state.items.map(item => {
        if (item.id !== action.transaction.id) return item;
        return { ...item, tags: [...item.tags, action.tag] };
      }),
    };
  // Removing tags from transactions
  case REQUEST_TO_REMOVE_TAG_FROM_TRANSACTION:
    return {
      ...state,
      isRemovingTag: true,
    };
  case REMOVE_TAG_FROM_TRANSACTION:
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
  default:
    return state;
  }
};

export default transactions;
