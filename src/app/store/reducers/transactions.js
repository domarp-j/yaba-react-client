import { findIndex, reject, update } from 'ramda';

import { initialState } from '../store';

import {
  DEFAULT_FETCH_LIMIT,
  REQUEST_TRANSACTIONS,
  RECEIVE_TRANSACTIONS,
  REPORT_NO_TRANSACTIONS,
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
  ADD_TRANSACTION_TAG,
  UPDATE_TRANSACTION_TAG,
  REMOVE_TRANSACTION_TAG
} from '../actions/tags';

import {
  MODIFY_DESCRIPTION_FOR_TRANSACTION_QUERY,
  ADD_TAG_NAME_TO_TRANSACTION_QUERY,
  REMOVE_TAG_NAME_FROM_TRANSACTION_QUERY,
  MODIFY_DATE_FOR_TRANSACTION_QUERY,
  REPLACE_TAG_NAMES_IN_TRANSACTION_QUERY,
  MODIFY_MATCH_ALL_TAGS_TRANSACTION_QUERY,
  CLEAR_TRANSACTION_QUERIES
} from '../actions/queries';

import {
  MODIFY_SORT_CATEGORY,
  MODIFY_SORT_ORDER
} from '../actions/sorting';

const transactions = (
  state = initialState.transactions,
  action
) => {
  switch (action.type) {
  // Fetching transactions
  case REQUEST_TRANSACTIONS:
    return {
      ...state,
      events: {
        ...state.events,
        isFetching: true,
        noTransactionsFound: false,
      },
    };
  case RECEIVE_TRANSACTIONS:
    return {
      ...state,
      events: {
        ...state.events,
        allTransactionsFetched: action.transactions.items.length < DEFAULT_FETCH_LIMIT,
        isFetching: false,
      },
      count: action.transactions.count,
      totalAmount: action.transactions.totalAmount,
      items: [...state.items, ...action.transactions.items],
    };
  case REPORT_NO_TRANSACTIONS:
    return {
      ...state,
      events: {
        ...state.events,
        allTransactionsFetched: true,
        isFetching: false,
        noTransactionsFound: true,
      },
    };
  // Adding transactions
  case REQUEST_TO_ADD_TRANSACTION:
    return {
      ...state,
      events: {
        ...state.events,
        isAdding: true,
      },
    };
  case PUSH_NEW_TRANSACTION:
    return {
      ...state,
      events: { ...state.events, isAdding: false },
      items: [{ ...action.transaction, justAdded: true, tags: [] }, ...state.items],
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
      events: { ...state.events, isEditing: true },
    };
  case EDIT_TRANSACTION:
    return {
      ...state,
      events: { ...state.events, isEditing: false },
      items: state.items.map(item => {
        if (item.id !== action.transaction.id) return item;
        return { ...action.transaction, tags: item.tags };
      }),
    };
  // Deleting transactions
  case REQUEST_TO_DELETE_TRANSACTION:
    return {
      ...state,
      events: { ...state.events, isDeleting: true },
    };
  case REMOVE_DELETED_TRANSACTION:
    return {
      ...state,
      events: { ...state.events, isDeleting: false },
      items: reject(item => (
        item.id === action.transaction.id
      ), state.items),
    };
  // Clearing transactions from the store
  case CLEAR_TRANSACTIONS:
    return {
      ...state,
      events: { ...state.events, isFetching: false },
      items: [],
    };
  // Adding a tag to a transaction
  case ADD_TRANSACTION_TAG:
    return {
      ...state,
      items: state.items.map(item => {
        if (item.id !== action.transaction.id) return item;
        return { ...item, tags: [...item.tags, action.tag] };
      }),
    };
  // Updating a tag for a transaction
  case UPDATE_TRANSACTION_TAG:
    return {
      ...state,
      items: state.items.map(item => {
        if (item.id !== action.transaction.id) return item;
        return {
          ...item,
          tags: update(
            findIndex(tag => tag.id === action.oldTag.id)(item.tags),
            action.newTag,
            item.tags
          ),
        };
      }),
    };
  // Removing a tag from a transaction
  case REMOVE_TRANSACTION_TAG:
    return {
      ...state,
      items: state.items.map(item => {
        if (item.id !== action.transaction.id) return item;
        return {
          ...item,
          tags: reject(tag => (
            tag.id === action.tag.id && tag.name === action.tag.name
          ), item.tags),
        };
      }),
    };
  // Modifying the description for the transactions filter query
  case MODIFY_DESCRIPTION_FOR_TRANSACTION_QUERY:
    return {
      ...state,
      queries: {
        ...state.queries,
        description: action.description,
      },
    };
  // Modify the fromDate or toDate for the transactions filter query
  case MODIFY_DATE_FOR_TRANSACTION_QUERY:
    return {
      ...state,
      queries: {
        ...state.queries,
        [action.dateType]: action.date,
      },
    };
  // Adding a tag name to the transactions filter query
  case ADD_TAG_NAME_TO_TRANSACTION_QUERY:
    return {
      ...state,
      queries: {
        ...state.queries,
        tagNames: [...state.queries.tagNames, action.tagName],
      },
    };
  // Removing a tag name from the transactions filter query
  case REMOVE_TAG_NAME_FROM_TRANSACTION_QUERY:
    return {
      ...state,
      queries: {
        ...state.queries,
        tagNames: reject(tagName => (
          tagName === action.tagName
        ), state.queries.tagNames),
      },
    };
  // Replacing all tag names for the transactions filter query
  case REPLACE_TAG_NAMES_IN_TRANSACTION_QUERY:
    return {
      ...state,
      queries: {
        ...state.queries,
        tagNames: action.tagNames,
      },
    };
  // Modify matchAllTags bool for the transactions filter query
  case MODIFY_MATCH_ALL_TAGS_TRANSACTION_QUERY:
    return {
      ...state,
      queries: {
        ...state.queries,
        matchAllTags: action.matchAllTags,
      },
    };
  // Clearing transactions filter query
  case CLEAR_TRANSACTION_QUERIES:
    return {
      ...state,
      queries: initialState.transactions.queries,
    };
  // Modify sort category
  case MODIFY_SORT_CATEGORY:
    return {
      ...state,
      sorting: {
        ...state.sorting,
        category: action.category,
      },
    };
  // Modify sort order
  case MODIFY_SORT_ORDER:
    return {
      ...state,
      sorting: {
        ...state.sorting,
        order: action.order,
      },
    };
  default:
    return state;
  }
};

export default transactions;
