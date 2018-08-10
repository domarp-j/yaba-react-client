import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Input } from 'semantic-ui-react';
import { withFormik } from 'formik';
import * as yup from 'yup';
import { compose } from 'ramda';
import { connect } from 'react-redux';

import { createTag } from '../../../store/actions/tags';

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

const cancelTagForm = (e, handleCancel) => {
  e.preventDefault();
  handleCancel();
};

const TagForm = ({
  errors,
  handleChange,
  handleSubmit,
  handleCancel,
  isAddingTag,
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
      color='green'
      loading={isAddingTag}
      onClick={e => submitTagForm(e, handleSubmit, setTouched)}
    >
      <Button.Content className='no-padding'>
        <Icon name='plus' className='no-margin' />
      </Button.Content>
    </Button>

    <Button
      color='red'
      onClick={e => cancelTagForm(e, handleCancel) }
    >
      <Button.Content className='no-padding'>
        <Icon name='cancel' className='no-margin' />
      </Button.Content>
    </Button>
  </Input>
);

TagForm.propTypes = {
  errors: PropTypes.shape({
    tagName: PropTypes.string,
  }),
  handleCancel: PropTypes.func,
  handleChange: PropTypes.func,
  handleSubmit: PropTypes.func,
  isAddingTag: PropTypes.bool,
  setTouched: PropTypes.func,
  touched: PropTypes.shape({
    tagName: PropTypes.bool,
  }),
  transactionId: PropTypes.number,
  values: PropTypes.shape({
    tagName: PropTypes.string,
  }),
};

const schema = yup.object().shape({
  tagName: yup.string().required(),
});

const formikOptions = {
  handleSubmit: (values, { props }) => {
    props.createTag({
      tagName: values.tagName,
      transactionId: props.transactionId,
    });
    props.handleCancel();
  },
  validationSchema: schema,
};

const mapStateToProps = state => ({
  isAddingTag: state.transactions.isAddingTag,
});

const mapDispatchToProps = dispatch => ({
  createTag: data => { dispatch(createTag(data)); },
});

export { TagForm as BaseTagForm };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withFormik(formikOptions)
)(TagForm);
