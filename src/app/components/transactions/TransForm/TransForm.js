import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Form, Message } from 'semantic-ui-react';
import { withFormik } from 'formik';
import { compose } from 'ramda';
import * as yup from 'yup';
import { connect } from 'react-redux';

import { createTransaction } from '../../../store/actions/transactions';
import { currentDateYMD } from '../../../utils/dateTools';
import { allFieldsTouched, anyErrorsPresent, errorsList, touchAllFields } from '../../../utils/formikTools';
import { extractTags } from '../../../utils/tagTools';

const fields = ['description'];

class TransForm extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    createTransaction: PropTypes.func,
    errors: PropTypes.shape({
      description: PropTypes.string,
    }),
    handleBlur: PropTypes.func,
    handleChange: PropTypes.func,
    handleSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
    isAddingTransaction: PropTypes.bool,
    setTouched: PropTypes.func,
    setValues: PropTypes.func,
    touched: PropTypes.shape({
      description: PropTypes.bool,
    }),
    values: PropTypes.shape({
      description: PropTypes.string,
    }),
  };

  static defaultProps = {
    className: '',
  }

  render() {
    const {
      className,
      errors,
      handleChange,
      handleSubmit,
      isAddingTransaction,
      onCancel,
      setTouched,
      touched,
      values,
    } = this.props;

    return (
      <Card
        className={`trans-form ${className}`}
        fluid
      >
        <Card.Content>
          <Card.Description id='trans-form-content' >
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Field
                  className='description-field'
                  error={allFieldsTouched(touched, fields) && !!errors.description}
                  width={16}
                >
                  <label htmlFor='description'>Description</label>
                  <Form.Input
                    name='description'
                    onChange={handleChange}
                    value={values.description}
                  />
                </Form.Field>
              </Form.Group>

              <Message
                error
                visible={allFieldsTouched(touched, fields) && anyErrorsPresent(errors)}
                list={errorsList(errors)}
              />

              <div className='margin-top-10-mobile'>
                <Button
                  className='trans-form-button green-button'
                  content='Save'
                  disabled={allFieldsTouched(touched, fields) && anyErrorsPresent(errors)}
                  loading={isAddingTransaction}
                  onClick={() => { setTouched(touchAllFields(fields)); }}
                />

                <Button
                  className='trans-form-button'
                  content='Cancel'
                  onClick={e => { e.preventDefault(); onCancel(); }}
                />
              </div>
            </Form>
          </Card.Description>
        </Card.Content>
      </Card>
    );
  }
}

const schema = yup.object().shape({
  description: yup.string().required('A description of the transaction is required'),
});

const formikOptions = {
  handleSubmit: (values, { props, resetForm, setValues }) => {
    new Promise(resolve => {
      props.createTransaction({
        amount: '0',
        date: currentDateYMD(),
        description: values.description,
        tags: extractTags(values.description),
      });
      resolve();
    }).then(() => {
      setValues({});
      resetForm();
      props.onSave();
    });
  },
  validationSchema: schema,
};

const mapStateToProps = state => ({
  isAddingTransaction: state.transactions.boolEvents.isAddingTransaction,
});

const mapDispatchToProps = dispatch => ({
  createTransaction: data => dispatch(createTransaction(data)),
});

export { TransForm as BaseTransForm };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withFormik(formikOptions)
)(TransForm);
