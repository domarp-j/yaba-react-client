import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Form, Message, Button } from 'semantic-ui-react';
import { withFormik } from 'formik';
import { compose } from 'ramda';
import moment from 'moment';
import * as yup from 'yup';
import Cleave from 'cleave.js/react';
import { connect } from 'react-redux';

import { createTransaction } from '../../../store/actions/transactions';
import { errorsList, allFieldsTouched, anyErrorsPresent, touchAllFields } from '../../../utils/formikTools';

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
        date: moment(values.date).format('YYYY-MM-DD'),
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
      setTouched,
      touched,
      values,
    } = this.props;

    const { positiveAmount } = this.state;

    return (
      <Segment basic>
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

          <Form.Button
            color='green'
            content='Add'
            disabled={allFieldsTouched(touched, fields) && anyErrorsPresent(errors)}
            loading={isAdding}
            onClick={() => { setTouched(touchAllFields(fields)); }}
            size='large'
          />
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
    });
  },
  mapPropsToValues: () => ({
    date: moment().format('MM/DD/YYYY'),
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
