import routes from '../../routes';
import yabaAxios from '../../utils/yabaAxios';

// Adding tags

export const REQUEST_TO_ADD_TAG = 'REQUEST_TO_ADD_TAG';
export const requestAddTag = () => ({
  type: REQUEST_TO_ADD_TAG,
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

export const createTag = (data={}) => dispatch => {
  dispatch(requestAddTag());

  return yabaAxios.post(routes.transactionTags(data.transactionId), {
    name: data.tagName,
  }).then(response => { dispatch(addTagToTransaction(response.data.content)); });
};

