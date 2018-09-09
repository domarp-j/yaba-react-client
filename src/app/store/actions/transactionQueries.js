// Adding a tagName to the transactions filter query

export const ADD_TAG_NAME_TO_TRANSACTION_QUERY = 'ADD_TAG_NAME_TO_TRANSACTION_QUERY';
export const addTagNameToTransactionQuery = options => ({
  type: ADD_TAG_NAME_TO_TRANSACTION_QUERY,
  tagName: options.tagName,
});

// Removing a tagName from the transactions filter query

export const REMOVE_TAG_NAME_FROM_TRANSACTION_QUERY = 'REMOVE_TAG_NAME_FROM_TRANSACTION_QUERY';
export const removeTagNameFromTransactionQuery = tagName => ({
  type: REMOVE_TAG_NAME_FROM_TRANSACTION_QUERY,
  tagName,
});

// fromDate and toDate date types that date actions below will use

export const FROM_DATE = 'fromDate';
export const TO_DATE = 'toDate';

// Modify fromDate or toDate for the transactions filter query

export const MODIFY_DATE_FOR_TRANSACTION_QUERY = 'MODIFY_DATE_FOR_TRANSACTION_QUERY';
export const modifyDateForTransactionQuery = (dateType, date) => ({
  type: MODIFY_DATE_FOR_TRANSACTION_QUERY,
  dateType,
  date,
});
