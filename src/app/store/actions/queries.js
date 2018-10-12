// Modify description

export const MODIFY_DESCRIPTION_FOR_TRANSACTION_QUERY = 'MODIFY_DESCRIPTION_FOR_TRANSACTION_QUERY';
export const modifyDescriptionForTransactionQuery = description => ({
  type: MODIFY_DESCRIPTION_FOR_TRANSACTION_QUERY,
  description,
});

// fromDate and toDate date types

export const FROM_DATE = 'fromDate';
export const TO_DATE = 'toDate';

// Modify fromDate or toDate

export const MODIFY_DATE_FOR_TRANSACTION_QUERY = 'MODIFY_DATE_FOR_TRANSACTION_QUERY';
export const modifyDateForTransactionQuery = (dateType, date) => ({
  type: MODIFY_DATE_FOR_TRANSACTION_QUERY,
  dateType,
  date,
});

// Adding a tagName

export const ADD_TAG_NAME_TO_TRANSACTION_QUERY = 'ADD_TAG_NAME_TO_TRANSACTION_QUERY';
export const TagAddNameToTransactionQuery = options => ({
  type: ADD_TAG_NAME_TO_TRANSACTION_QUERY,
  tagName: options.tagName,
});

// Removing a tagName

export const REMOVE_TAG_NAME_FROM_TRANSACTION_QUERY = 'REMOVE_TAG_NAME_FROM_TRANSACTION_QUERY';
export const removeTagNameFromTransactionQuery = tagName => ({
  type: REMOVE_TAG_NAME_FROM_TRANSACTION_QUERY,
  tagName,
});

// Replacing tagNames

export const REPLACE_TAG_NAMES_IN_TRANSACTION_QUERY = 'REPLACE_TAG_NAMES_IN_TRANSACTION_QUERY';
export const replaceTagNamesInTransactionQuery = tagNames => ({
  type: REPLACE_TAG_NAMES_IN_TRANSACTION_QUERY,
  tagNames,
});

// Modifying matchAllTags bool

export const MODIFY_MATCH_ALL_TAGS_TRANSACTION_QUERY = 'MODIFY_MATCH_ALL_TAGS_TRANSACTION_QUERY';
export const modifyMatchAllTagsTransactionQuery = matchAllTags => ({
  type: MODIFY_MATCH_ALL_TAGS_TRANSACTION_QUERY,
  matchAllTags,
});

// Clearing all queries

export const CLEAR_TRANSACTION_QUERIES = 'CLEAR_TRANSACTION_QUERIES';
export const clearTransactionQueries = () => ({
  type: CLEAR_TRANSACTION_QUERIES,
});
