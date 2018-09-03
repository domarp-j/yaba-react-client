// Adding tag name to transactions filter query

export const ADD_TAG_NAME_TO_TRANSACTION_QUERY = 'ADD_TAG_NAME_TO_TRANSACTION_QUERY';
export const addTagNameToTransactionQuery = options => ({
  type: ADD_TAG_NAME_TO_TRANSACTION_QUERY,
  tagName: options.tagName,
});

// Removing tag name from transactions filter query

export const REMOVE_TAG_NAME_FROM_TRANSACTION_QUERY = 'REMOVE_TAG_NAME_FROM_TRANSACTION_QUERY';
export const removeTagNameFromTransactionQuery = tagName => ({
  type: REMOVE_TAG_NAME_FROM_TRANSACTION_QUERY,
  tagName,
});
