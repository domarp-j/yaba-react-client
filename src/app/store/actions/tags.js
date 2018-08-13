import routes from '../../routes';
import yabaAxios from '../../utils/yabaAxios';

// Adding tags to transaction

export const REQUEST_TO_ADD_TAG_TO_TRANSACTION = 'REQUEST_TO_ADD_TAG_TO_TRANSACTION';
export const requestAddTagToTransaction = () => ({
  type: REQUEST_TO_ADD_TAG_TO_TRANSACTION,
});

export const ADD_TAG_TO_TRANSACTION = 'ADD_TAG_TO_TRANSACTION';
export const addTagToTransaction = tag => ({
  type: ADD_TAG_TO_TRANSACTION,
  transaction: {
    id: tag.transaction_id,
  },
  tag: {
    id: tag.id,
    name: tag.name,
  },
});

export const attachTagToTransaction = (data={}) => dispatch => {
  dispatch(requestAddTagToTransaction());

  return yabaAxios.post(routes.addTransactionTag(data.transactionId), {
    name: data.tagName,
  }).then(response => { dispatch(addTagToTransaction(response.data.content)); });
};

// Removing tags from transactions

export const REQUEST_TO_REMOVE_TAG_FROM_TRANSACTION = 'REQUEST_TO_REMOVE_TAG_FROM_TRANSACTION';
export const requestRemoveTagFromTransaction = () => ({
  type: REQUEST_TO_REMOVE_TAG_FROM_TRANSACTION,
});

export const REMOVE_TAG_FROM_TRANSACTION = 'REMOVE_TAG_FROM_TRANSACTION';
export const removeTagFromTransaction = tag => ({
  type: REMOVE_TAG_FROM_TRANSACTION,
  transaction: {
    id: tag.transaction_id,
  },
  tag: {
    id: tag.id,
    name: tag.name,
  },
});

export const detachTagFromTransaction = (data={}) => dispatch => {
  dispatch(requestRemoveTagFromTransaction());

  return yabaAxios.post(routes.deleteTransactionTag(data.transactionId), {
    id: data.tagId,
    name: data.tagName,
  }).then(response => { dispatch(removeTagFromTransaction(response.data.content)); });
};
