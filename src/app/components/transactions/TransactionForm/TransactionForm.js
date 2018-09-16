import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Form, Message, Button } from 'semantic-ui-react';
import { withFormik } from 'formik';
import { compose } from 'ramda';
import * as yup from 'yup';
import Cleave from 'cleave.js/react';
import { connect } from 'react-redux';

import { createTransaction } from '../../../store/actions/transactions';
import { errorsList, allFieldsTouched, anyErrorsPresent, touchAllFields } from '../../../utils/formikTools';
import { currentDateMDY, dateToYMD } from '../../../utils/dateTools';

import './TransactionForm.css';

const fields = ['description', 'amount', 'date'];

class TransactionForm extends React.Component {
  static propTypes = {
    createTransaction: PropTypes.func,
    errors: PropTypes.shape({
      description: PropTypes.string,
      amount: PropTypes.string,
      date: PropTypes.string,
    }),
    handleBlur: PropTypes.func,
    handleChange: PropTypes.func,
    handleSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
    isAdding: PropTypes.bool,
    setTouched: PropTypes.func,
    setValues: PropTypes.func,
    touched: PropTypes.shape({
      amount: PropTypes.bool,
      date: PropTypes.bool,
      description: PropTypes.bool,
    }),
    values: PropTypes.shape({
      amount: PropTypes.string,
      date: PropTypes.string,
      description: PropTypes.string,
    }),
  };

  constructor() {
    super();
    this.state = {
      positiveAmount: true,
    };
  }

  amountButton = {
    [true]: { color: 'green', icon: 'plus' },
    [false]: { color: 'red', icon: 'minus' },
  };

  changeAmountType = e => {
    e.preventDefault();
    this.setState(prevState => ({
      positiveAmount: !prevState.positiveAmount,
    }));
  };

  setValuesAndSubmit = e => {
    const { handleSubmit, setValues, values } = this.props;
    const { positiveAmount } = this.state;

    new Promise(resolve => {
      setValues({
        amount: (positiveAmount ? '+' : '-') + values.amount.replace(/\$|,/g, ''),
        description: values.description,
        date: dateToYMD(values.date),
      });
      resolve();
    }).then(() => handleSubmit(e));
  }

  render() {
    const {
      errors,
      handleBlur,
      handleChange,
      isAdding,
      onCancel,
      setTouched,
      touched,
      values,
    } = this.props;

    const { positiveAmount } = this.state;

    return (
      <Segment className='padding-30'>
        <h2>Add a transaction</h2>

        <Form onSubmit={this.setValuesAndSubmit}>
          <Form.Group>
            <Form.Field
              error={allFieldsTouched(touched, fields) && !!errors.date}
              width={3}
            >
              <label htmlFor='date'>Date</label>
              <div className='ui input'>
                <Cleave
                  id='date'
                  name='date'
                  options={{
                    date: true, datePattern: ['m', 'd', 'Y'],
                  }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.date}
                />
              </div>
            </Form.Field>

            <Form.Input
              className='margin-top-20-mobile'
              label='Description'
              type='text'
              name='description'
              id='description'
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.description || ''}
              error={allFieldsTouched(touched, fields) && !!errors.description}
              width={10}
            />

            <Form.Field
              className='margin-top-20-mobile'
              error={allFieldsTouched(touched, fields) && !!errors.amount}
              width={3}
            >
              <label htmlFor='date'>Amount</label>
              <div className='ui left action input'>
                <Button
                  color={this.amountButton[positiveAmount].color}
                  icon={this.amountButton[positiveAmount].icon}
                  onClick={e => { this.changeAmountType(e); }}
                />
                <Cleave
                  id='amount'
                  name='amount'
                  options={{
                    numeral: true,
                    numeralPositiveOnly: true,
                    prefix: '$',
                  }}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.amount || ''}
                />
              </div>
            </Form.Field>
          </Form.Group>

          <div className='margin-top-30-mobile'>
            <Button
              className='full-width-mobile margin-top-10-mobile margin-top-15'
              color='green'
              content='Add'
              disabled={allFieldsTouched(touched, fields) && anyErrorsPresent(errors)}
              loading={isAdding}
              onClick={() => { setTouched(touchAllFields(fields)); }}
              size='large'
            />

            <Button
              className='full-width-mobile margin-top-10-mobile margin-top-15'
              content='Cancel'
              onClick={e => { e.preventDefault(); onCancel(); }}
              size='large'
            />
          </div>
        </Form>

        <Message
          error
          hidden={!(allFieldsTouched(touched, fields) && anyErrorsPresent(errors))}
          header='There was an error while adding your transaction'
          list={errorsList(errors)}
        />
      </Segment>
    );
  }
}

const schema = yup.object().shape({
  amount: yup.string()
    .required('The amount of the transaction is required'),
  date: yup.string()
    .required('The date of the transaction is required'),
  description: yup.string()
    .required('A description of the transaction is required'),
});

const formikOptions = {
  handleSubmit: (values, { props, resetForm, setValues }) => {
    new Promise(resolve => {
      props.createTransaction(values);
      resolve();
    }).then(() => {
      setValues({});
      resetForm();
      props.onSave();
    });
  },
  mapPropsToValues: () => ({
    date: currentDateMDY(),
  }),
  validationSchema: schema,
};


const mapStateToProps = state => ({
  isAdding: state.transactions.events.isAdding,
});

const mapDispatchToProps = dispatch => ({
  createTransaction: data => { dispatch(createTransaction(data)); },
});

export { TransactionForm as BaseTransactionForm };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withFormik(formikOptions)
)(TransactionForm);
