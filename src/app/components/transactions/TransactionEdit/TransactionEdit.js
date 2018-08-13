import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Form, Message, Button } from 'semantic-ui-react';
import { withFormik } from 'formik';
import { compose } from 'ramda';
import moment from 'moment';
import * as yup from 'yup';
import Cleave from 'cleave.js/react';
import { connect } from 'react-redux';

import { toggleEditState, updateTransaction } from '../../../store/actions/transactions';
import { errorsList, allFieldsTouched, anyErrorsPresent, touchAllFields } from '../../../utils/formikTools';
import { dollarToFloat } from '../../../utils/transactions';

const fields = ['description', 'amount', 'date'];

class TransactionEdit extends React.Component {
  static propTypes = {
    amount: PropTypes.string,
    date: PropTypes.string,
    description: PropTypes.string,
    errors: PropTypes.shape({
      description: PropTypes.string,
      amount: PropTypes.string,
      date: PropTypes.string,
    }),
    handleBlur: PropTypes.func,
    handleChange: PropTypes.func,
    handleSubmit: PropTypes.func,
    isEditing: PropTypes.bool,
    setTouched: PropTypes.func,
    setValues: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.string),
    toggleEditState: PropTypes.func,
    touched: PropTypes.shape({
      amount: PropTypes.bool,
      date: PropTypes.bool,
      description: PropTypes.bool,
    }),
    transactionId: PropTypes.number,
    updateTransaction: PropTypes.func,
    values: PropTypes.shape({
      amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      date: PropTypes.string,
      description: PropTypes.string,
    }),
  };

  constructor() {
    super();
    this.state = {
      positiveAmount: false,
    };
  }

  componentDidMount() {
    this.setState({
      positiveAmount: dollarToFloat(this.props.amount) >= 0,
    });
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
        amount: (positiveAmount ? '+' : '-') + values.amount.slice(1).replace(/\$|,/g, ''),
        description: values.description,
        date: moment(values.date).format('YYYY-MM-DD'),
      });
      resolve();
    }).then(() => handleSubmit(e));
  }

  handleCancel = e => {
    e.preventDefault();
    this.props.toggleEditState({
      amount: this.props.amount,
      date: this.props.date,
      description: this.props.description,
      id: this.props.transactionId,
      tags: this.props.tags,
    }, false);
  }

  render() {
    const {
      errors,
      handleBlur,
      handleChange,
      isEditing,
      setTouched,
      touched,
      values,
    } = this.props;

    const { positiveAmount } = this.state;

    return (
      <Segment>
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
              value={values.description}
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
                  value={values.amount}
                />
              </div>
            </Form.Field>
          </Form.Group>

          <Form.Field>
            <Button
              color='blue'
              content='Save'
              disabled={allFieldsTouched(touched, fields) && anyErrorsPresent(errors)}
              loading={isEditing}
              onClick={() => { setTouched(touchAllFields(fields)); }}
              size='medium'
            />

            <Button
              content='Cancel'
              onClick={this.handleCancel}
              size='medium'
            />
          </Form.Field>
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
      props.updateTransaction({
        amount: values.amount,
        date: values.date,
        description: values.description,
        id: props.transactionId,
        tags: props.tags,
      });
      resolve();
    }).then(() => {
      setValues({});
      resetForm();
    });
  },
  mapPropsToValues: props => ({
    amount: props.amount || '',
    date: props.date || moment().format('MM/DD/YYYY'),
    description: props.description || '',
  }),
  validationSchema: schema,
};


const mapStateToProps = state => ({
  isEditing: state.transactions.isEditing,
});

const mapDispatchToProps = dispatch => ({
  toggleEditState: (transaction, editMode) => { dispatch(toggleEditState(transaction, editMode)); },
  updateTransaction: data => { dispatch(updateTransaction(data)); },
});

export { TransactionEdit as BaseTransactionEdit };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withFormik(formikOptions)
)(TransactionEdit);
