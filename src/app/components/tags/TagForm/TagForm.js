import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Input } from 'semantic-ui-react';
import { withFormik } from 'formik';
import * as yup from 'yup';
import { compose } from 'ramda';
import { connect } from 'react-redux';

import { attachTagToTransaction, modifyTransactionTag } from '../../../store/actions/transactionTags';

import './TagForm.css';

const maskInputAndHandleChange = (e, handleChange) => {
  e.target.value = e.target.value.replace(/\s/, '');
  handleChange(e);
};

const submitTagForm = (e, handleSubmit, setTouched) => {
  e.persist();
  new Promise(resolve => {
    setTouched({ tagName: true });
    resolve();
  }).then(() => handleSubmit(e));
};

const cancelTagForm = (e, onCancel) => {
  e.preventDefault();
  onCancel();
};

const TagForm = ({
  errors,
  handleChange,
  handleSubmit,
  isAddingTag,
  onCancel,
  setTouched,
  touched,
  values,
}) => (
  <Input
    action
    className='tag-form'
    error={touched.tagName && !!errors.tagName}
    name='tagName'
    id='tagName'
    onChange={e => maskInputAndHandleChange(e, handleChange)}
    placeholder='Add a tag...'
    type='text'
    value={values.tagName}
  >
    <input />

    <Button
      className='grouped-button'
      color='green'
      loading={isAddingTag}
      onClick={e => submitTagForm(e, handleSubmit, setTouched)}
    >
      <Button.Content className='no-padding'>
        <Icon name='checkmark' className='no-margin' />
      </Button.Content>
    </Button>

    <Button
      className='grouped-button'
      color='red'
      onClick={e => cancelTagForm(e, onCancel) }
    >
      <Button.Content className='no-padding'>
        <Icon name='cancel' className='no-margin' />
      </Button.Content>
    </Button>
  </Input>
);

TagForm.propTypes = {
  editMode: PropTypes.bool,
  errors: PropTypes.shape({
    tagName: PropTypes.string,
  }),
  handleChange: PropTypes.func,
  handleSubmit: PropTypes.func,
  isAddingTag: PropTypes.bool,
  onCancel: PropTypes.func,
  setTouched: PropTypes.func,
  touched: PropTypes.shape({
    tagName: PropTypes.bool,
  }),
  tagId: PropTypes.number,
  transactionId: PropTypes.number,
  values: PropTypes.shape({
    tagName: PropTypes.string,
  }),
};

TagForm.defaultProps = {
  editMode: false,
};

const schema = yup.object().shape({
  tagName: yup.string().required(),
});

const formikOptions = {
  handleSubmit: (values, { props }) => {
    props.editMode ?
      props.modifyTransactionTag({
        tagId: props.tagId,
        tagName: values.tagName,
        transactionId: props.transactionId,
      }) :
      props.attachTagToTransaction({
        tagName: values.tagName,
        transactionId: props.transactionId,
      });

    props.onCancel();
  },
  mapPropsToValues: props => ({
    tagName: props.initialValues.tagName,
  }),
  validationSchema: schema,
};

const mapStateToProps = state => ({
  isAddingTag: state.transactions.isAddingTag,
});

const mapDispatchToProps = dispatch => ({
  attachTagToTransaction: data => { dispatch(attachTagToTransaction(data)); },
  modifyTransactionTag: data => { dispatch(modifyTransactionTag(data)); },
});

export { TagForm as BaseTagForm };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withFormik(formikOptions)
)(TagForm);
