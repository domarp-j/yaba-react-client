import routes from '../../routes';
import yabaAxios from '../../utils/yabaAxios';

// Adding tags to transaction

export const REQUEST_ADD_TRANSACTION_TAG = 'REQUEST_ADD_TRANSACTION_TAG';
export const requestAddTransactionTag = () => ({
  type: REQUEST_ADD_TRANSACTION_TAG,
});

export const ADD_TRANSACTION_TAG = 'ADD_TRANSACTION_TAG';
export const addTransactionTag = tag => ({
  type: ADD_TRANSACTION_TAG,
  transaction: {
    id: tag.transaction_id,
  },
  tag: {
    id: tag.id,
    name: tag.name,
  },
});

export const attachTagToTransaction = (data={}) => dispatch => {
  dispatch(requestAddTransactionTag());

  return yabaAxios.post(routes.addTransactionTag(data.transactionId), {
    name: data.tagName,
  }).then(response => { dispatch(addTransactionTag(response.data.content)); });
};

// Updating tags for transactions

export const REQUEST_UPDATE_TRANSACTION_TAG = 'REQUEST_UPDATE_TRANSACTION_TAG';
export const requestUpdateTransactionTag = () => ({
  type: REQUEST_UPDATE_TRANSACTION_TAG,
});

export const UPDATE_TRANSACTION_TAG = 'UPDATE_TRANSACTION_TAG';
export const updateTransactionTag = (oldTag, newTag) => ({
  type: UPDATE_TRANSACTION_TAG,
  transaction: { id: newTag.transaction_id },
  oldTag,
  newTag,
});

export const modifyTransactionTag = (data={}) => dispatch => {
  const tagBeforeUpdate = {
    id: data.tagId,
    name: data.tagName,
  };

  dispatch(requestUpdateTransactionTag());

  return yabaAxios.post(routes.updateTransactionTag(data.transactionId), tagBeforeUpdate)
    .then(response => {
      const tagAfterUpdate = response.data.content;
      dispatch(updateTransactionTag(tagBeforeUpdate, tagAfterUpdate));
    });
};

// Removing tags from transactions

export const REQUEST_REMOVE_TRANSACTION_TAG = 'REQUEST_REMOVE_TRANSACTION_TAG';
export const requestRemoveTransactionTag = () => ({
  type: REQUEST_REMOVE_TRANSACTION_TAG,
});

export const REMOVE_TRANSACTION_TAG = 'REMOVE_TRANSACTION_TAG';
export const removeTransactionTag = tag => ({
  type: REMOVE_TRANSACTION_TAG,
  transaction: {
    id: tag.transaction_id,
  },
  tag: {
    id: tag.id,
    name: tag.name,
  },
});

export const detachTagFromTransaction = (data={}) => dispatch => {
  dispatch(requestRemoveTransactionTag());

  return yabaAxios.post(routes.deleteTransactionTag(data.transactionId), {
    id: data.tagId,
    name: data.tagName,
  }).then(response => { dispatch(removeTransactionTag(response.data.content)); });
};
