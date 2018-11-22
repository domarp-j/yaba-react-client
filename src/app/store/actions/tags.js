import routes from '../../routes';
import yabaAxios from '../../utils/yabaAxios';
import { ERROR, addAlert, serverErrorCheck } from './alerts';

// Fetching tags

export const REQUEST_TAGS = 'REQUEST_TAGS';
export const requestTags = () => ({
  type: REQUEST_TAGS,
});

export const RECEIVE_TAGS = 'RECEIVE_TAGS';
export const receiveTags = tags => ({
  type: RECEIVE_TAGS,
  tags,
});

export const fetchTags = () => dispatch => {
  dispatch(requestTags());

  return yabaAxios.get(routes.tags)
    .then(response => {
      dispatch(receiveTags(response.data.content));
    }).catch(err => {
      serverErrorCheck(err, dispatch);
    });
};

// Adding tags to transaction

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

export const attachTagToTransaction = ({ tagName, transactionId }) => dispatch => {
  return yabaAxios.post(routes.addTransactionTag(transactionId), {
    name: tagName,
  }).then(response => {
    dispatch(addTransactionTag(response.data.content));
  }).catch(err => {
    if (err.response.status >= 400) {
      const message = err.response.status === 404 ?
        'That tag already exists for the transaction you are modifying.' :
        'There was an error while trying to add a tag. Please try again.';

      dispatch(addAlert({
        type: ERROR,
        message,
      }));
    }
    serverErrorCheck(err, dispatch);
  });
};

// Updating tags for transactions

export const UPDATE_TRANSACTION_TAG = 'UPDATE_TRANSACTION_TAG';
export const updateTransactionTag = (oldTag, newTag) => ({
  type: UPDATE_TRANSACTION_TAG,
  transaction: { id: newTag.transaction_id },
  oldTag,
  newTag,
});

export const modifyTransactionTag = ({ tagId, tagName, transactionId }) => dispatch => {
  const tagBeforeUpdate = {
    id: tagId,
    name: tagName,
  };

  return yabaAxios.post(routes.updateTransactionTag(transactionId), tagBeforeUpdate)
    .then(response => {
      const tagAfterUpdate = response.data.content;
      dispatch(updateTransactionTag(tagBeforeUpdate, tagAfterUpdate));
    }).catch(err => {
      if (err.response.status >= 400) {
        dispatch(addAlert({
          type: ERROR,
          message: 'We could not update your tag. Please make sure the tag name does not contain any spaces.',
        }));
      }
      serverErrorCheck(err, dispatch);
    });
};

// Removing tags from transactions

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

export const detachTagFromTransaction = ({ tagId, tagName, transactionId }) => dispatch => {
  return yabaAxios.post(routes.deleteTransactionTag(transactionId), {
    id: tagId,
    name: tagName,
  }).then(response => {
    dispatch(removeTransactionTag(response.data.content));
  }).catch(err => {
    if (err.response.status >= 400) {
      dispatch(addAlert({
        type: ERROR,
        message: 'We could not delete your tag.',
      }));
    }
    serverErrorCheck(err, dispatch);
  });
};
