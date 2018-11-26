import { findIndex, reject, uniq, update } from 'ramda';

import { initialState } from '../store';
import { dollarToFloat, floatToDollar } from '../../utils/dollarTools';

import {
  DEFAULT_FETCH_LIMIT,
  REQUEST_TRANSACTIONS,
  RECEIVE_TRANSACTIONS,
  REPORT_NO_TRANSACTIONS,
  REQUEST_TO_ADD_TRANSACTION,
  PUSH_NEW_TRANSACTION,
  REQUEST_TO_UPDATE_TRANSACTION,
  EDIT_TRANSACTION,
  REQUEST_TO_DELETE_TRANSACTION,
  REMOVE_DELETED_TRANSACTION,
  CLEAR_TRANSACTIONS
} from '../actions/transactions';

import {
  REQUEST_TAGS,
  RECEIVE_TAGS,
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

// Helpers

const queryPresent = queries => (
  queries.description ||
    queries.fromDate ||
    queries.toDate ||
    queries.tagNames.length > 0
);

// Reducer

const transactions = (
  state = initialState.transactions,
  action
) => {
  switch (action.type) {

  // Fetching transactions
  case REQUEST_TRANSACTIONS:
    return {
      ...state,
      boolEvents: {
        ...state.boolEvents,
        isFetchingTransactions: true,
        noTransactionsFound: false,
      },
    };
  case RECEIVE_TRANSACTIONS:
    return {
      ...state,
      boolEvents: {
        ...state.boolEvents,
        allTransactionsFetched: action.transactions.items.length < DEFAULT_FETCH_LIMIT,
        isFetchingTransactions: false,
      },
      count: action.transactions.count,
      totalAmount: action.transactions.totalAmount,
      items: [...state.items, ...action.transactions.items],
    };
  case REPORT_NO_TRANSACTIONS:
    return {
      ...state,
      boolEvents: {
        ...state.boolEvents,
        allTransactionsFetched: true,
        isFetchingTransactions: false,
        noTransactionsFound: true,
      },
    };

  // Adding transactions
  case REQUEST_TO_ADD_TRANSACTION:
    return {
      ...state,
      boolEvents: {
        ...state.boolEvents,
        isAddingTransaction: true,
      },
    };
  case PUSH_NEW_TRANSACTION:
    return {
      ...state,
      boolEvents: { ...state.boolEvents, isAddingTransaction: false },
      items: [{ ...action.transaction, justAdded: true, tags: [] }, ...state.items],
      count: state.count + 1,
      totalAmount: floatToDollar(
        dollarToFloat(state.totalAmount) +
        dollarToFloat(action.transaction.amount)
      ),
    };

  // Editing transactions
  case REQUEST_TO_UPDATE_TRANSACTION:
    return {
      ...state,
      boolEvents: { ...state.boolEvents, isEditingTransaction: true },
    };
  case EDIT_TRANSACTION:
    return {
      ...state,
      boolEvents: { ...state.boolEvents, isEditingTransaction: false },
      items: state.items.map(item => {
        if (item.id !== action.newTransaction.id) return item;
        return { ...action.newTransaction, tags: item.tags };
      }),
      totalAmount: floatToDollar(
        dollarToFloat(state.totalAmount) -
        dollarToFloat(action.oldTransaction.amount) +
        dollarToFloat(action.newTransaction.amount)
      ),
    };

  // Deleting transactions
  case REQUEST_TO_DELETE_TRANSACTION:
    return {
      ...state,
      boolEvents: { ...state.boolEvents, isDeletingTransaction: true },
    };
  case REMOVE_DELETED_TRANSACTION:
    return {
      ...state,
      boolEvents: { ...state.boolEvents, isDeletingTransaction: false },
      items: reject(item => (
        item.id === action.transaction.id
      ), state.items),
      count: state.count - 1,
      totalAmount: floatToDollar(
        dollarToFloat(state.totalAmount) -
        dollarToFloat(action.transaction.amount)
      ),
    };

  // Clearing transactions from the store
  case CLEAR_TRANSACTIONS:
    return {
      ...state,
      boolEvents: { ...state.boolEvents, isFetchingTransactions: false },
      items: [],
      count: 0,
      totalAmount: '$0.00',
    };

  // Fetching tags
  case REQUEST_TAGS:
    return {
      ...state,
      boolEvents: {
        ...state.boolEvents,
        isFetchingTags: true,
      },
    };
  case RECEIVE_TAGS:
    return {
      ...state,
      boolEvents: {
        ...state.boolEvents,
        isFetchingTags: false,
      },
      tags: action.tags,
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
      boolEvents: {
        ...state.boolEvents,
        queryPresent: queryPresent({
          ...state.queries,
          description: action.description,
        }),
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
      boolEvents: {
        ...state.boolEvents,
        queryPresent: queryPresent({
          ...state.queries,
          [action.dateType]: action.date,
        }),
      },
    };

  // Adding a tag name to the transactions filter query
  case ADD_TAG_NAME_TO_TRANSACTION_QUERY:
    return {
      ...state,
      queries: {
        ...state.queries,
        tagNames: uniq([...state.queries.tagNames, action.tagName]),
      },
      boolEvents: {
        ...state.boolEvents,
        queryPresent: true,
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
      boolEvents: {
        ...state.boolEvents,
        queryPresent: queryPresent({
          ...state.queries,
          tagNames: reject(tagName => (
            tagName === action.tagName
          ), state.queries.tagNames),
        }),
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
      boolEvents: {
        ...state.boolEvents,
        queryPresent: queryPresent({
          ...state.queries,
          tagNames: action.tagNames,
        }),
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
      boolEvents: {
        ...state.boolEvents,
        queryPresent: false,
      },
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
