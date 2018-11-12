import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Form, Input } from 'semantic-ui-react';
import { withFormik } from 'formik';
import { compose } from 'ramda';
import * as yup from 'yup';
import Cleave from 'cleave.js/react';
import { connect } from 'react-redux';

import { createTransaction, updateTransaction } from '../../../store/actions/transactions';
import { allFieldsTouched, anyErrorsPresent, touchAllFields } from '../../../utils/formikTools';
import { currentDateMDY, dateToYMD } from '../../../utils/dateTools';
import { dollarToFloat } from '../../../utils/dollarTools';

const fields = ['description', 'amount', 'date'];

class TransForm extends React.Component {
  static propTypes = {
    createTransaction: PropTypes.func,
    editState: PropTypes.bool,
    updateTransaction: PropTypes.func,
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
    initialValues: PropTypes.shape({
      amount: PropTypes.string,
      date: PropTypes.string,
      description: PropTypes.string,
    }),
    isAdding: PropTypes.bool,
    setTouched: PropTypes.func,
    setValues: PropTypes.func,
    transactionId: PropTypes.number,
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

  static defaultProps = {
    editState: false,
    initialValues: {
      amount: '',
      date: '',
      description: '',
    },
  }

  constructor() {
    super();
    this.state = {
      positiveAmount: true,
    };
  }

  componentDidMount() {
    const { amount } = this.props.values;
    this.setState({
      positiveAmount: amount ? dollarToFloat(amount) >= 0 : true,
    });
  }

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
        amount: (positiveAmount ? '+' : '-') + values.amount.replace(/\$|,|-/g, ''),
        description: values.description,
        date: dateToYMD(values.date),
      });
      resolve();
    }).then(() => handleSubmit(e));
  }

  render() {
    const {
      editState,
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
      <Card className={`trans-form yaba-card amount-${positiveAmount ? 'pos' : 'neg'}`}>
        <Card.Content>
          <Card.Description >
            <Form onSubmit={this.setValuesAndSubmit}>
              <Form.Group>
                <Form.Field
                  error={allFieldsTouched(touched, fields) && !!errors.date}
                  width={7}
                >
                  <div className='ui input'>
                    <Cleave
                      className='input-height input-padding'
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

                <Form.Field
                  className='margin-top-10-mobile'
                  error={allFieldsTouched(touched, fields) && !!errors.amount}
                  width={9}
                >
                  <div className='ui left action input'>
                    <Button
                      className={`input-height amount-button ${positiveAmount ? 'success' : 'error'}-button`}
                      icon={positiveAmount ? 'plus' : 'minus'}
                      onClick={e => { this.changeAmountType(e); }}
                    />
                    <Cleave
                      className='input-height input-padding'
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

              <Form.Group>
                <Form.Field
                  className='margin-top-10-mobile'
                  error={allFieldsTouched(touched, fields) && !!errors.description}
                  width={16}
                >
                  <Input
                    className='input-height input-padding-inner'
                    name='description'
                    id='description'
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder='Description'
                    value={values.description || ''}
                  />
                </Form.Field>
              </Form.Group>

              <div className='margin-top-20-mobile'>
                <Button
                  className='trans-cta-button success-button'
                  content={editState ? 'Edit' : 'Add'}
                  disabled={allFieldsTouched(touched, fields) && anyErrorsPresent(errors)}
                  loading={isAdding}
                  onClick={() => { setTouched(touchAllFields(fields)); }}
                />

                <Button
                  className='trans-cta-button'
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
      props.editState ? props.updateTransaction({ ...values, id: props.transactionId }) : props.createTransaction(values);
      resolve();
    }).then(() => {
      setValues({});
      resetForm();
      props.onSave();
    });
  },
  mapPropsToValues: props => ({
    amount: props.initialValues ? props.initialValues.amount : '',
    date: props.initialValues ? props.initialValues.date : currentDateMDY(),
    description: props.initialValues ? props.initialValues.description : '',
  }),
  validationSchema: schema,
};


const mapStateToProps = state => ({
  isAdding: state.transactions.boolEvents.isAdding,
});

const mapDispatchToProps = dispatch => ({
  createTransaction: data => { dispatch(createTransaction(data)); },
  updateTransaction: data => { dispatch(updateTransaction(data)); },
});

export { TransForm as BaseTransForm };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withFormik(formikOptions)
)(TransForm);
