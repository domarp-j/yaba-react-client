import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Form, Input } from 'semantic-ui-react';
import { withFormik } from 'formik';
import { compose, contains } from 'ramda';
import * as yup from 'yup';
import Cleave from 'cleave.js/react';
import { connect } from 'react-redux';

import { TagAdd, TagButton, TagForm } from '../../tags';
import { createTransaction, updateTransaction } from '../../../store/actions/transactions';
import { attachTagToTransaction, detachTagFromTransaction, modifyTransactionTag } from '../../../store/actions/tags';
import { allFieldsTouched, anyErrorsPresent, touchAllFields } from '../../../utils/formikTools';
import { currentDateMDY, dateToYMD } from '../../../utils/dateTools';
import { dollarToFloat } from '../../../utils/dollarTools';

const fields = ['description', 'amount', 'date'];

class TransForm extends React.Component {
  static propTypes = {
    attachTagToTransaction: PropTypes.func,
    createTransaction: PropTypes.func,
    detachTagFromTransaction: PropTypes.func,
    editState: PropTypes.bool,
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
    initialTags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })),
    initialValues: PropTypes.shape({
      amount: PropTypes.string,
      date: PropTypes.string,
      description: PropTypes.string,
    }),
    isAddingTransaction: PropTypes.bool,
    modifyTransactionTag: PropTypes.func,
    setTouched: PropTypes.func,
    setValues: PropTypes.func,
    transactionId: PropTypes.number,
    touched: PropTypes.shape({
      amount: PropTypes.bool,
      date: PropTypes.bool,
      description: PropTypes.bool,
    }),
    updateTransaction: PropTypes.func,
    values: PropTypes.shape({
      amount: PropTypes.string,
      date: PropTypes.string,
      description: PropTypes.string,
    }),
  };

  static defaultProps = {
    editState: false,
    initialTags: [],
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
      showTagForm: false,
      tags: [],
    };
  }

  componentDidMount() {
    const { amount } = this.props.values;
    this.setState({
      positiveAmount: amount ? dollarToFloat(amount) >= 0 : true,
      tags: this.props.initialTags.map(tag => tag.name),
    });
  }

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
  }

  /*
    Add new tag to state.
    A new tag is NOT added if it is already present in state.
    If a transaction is currently being edited, then attach the new tag to the current transaction.
  */
  addTag = ({ tagName }) => {
    if (contains(tagName, this.state.tags)) return;

    if (this.props.editState) {
      this.props.attachTagToTransaction({ tagName, transactionId: this.props.transactionId });
    }

    this.setState(prevState => ({
      tags: prevState.tags.concat(tagName),
    }));
  }

  /*
    Edit a tag in state.
    If a transaction is currently being edited, then modify the tag for that transaction.
  */
  editTag = ({ oldTagName, tagName }) => {
    if (this.props.editState) {
      this.props.modifyTransactionTag({
        oldTagName,
        tagId: this.props.initialTags.find(tag => tag.name === oldTagName).id,
        tagName,
        transactionId: this.props.transactionId,
      });
    }

    this.setState(prevState => ({
      tags: prevState.tags.map(tagInState => (
        tagInState === oldTagName ? tagName : tagInState
      )),
    }));
  }

  /*
    Remove tag from state.
    If a transaction is currently being edited, then the removed tag will be detached from the transaction.
  */
  removeTag = ({ tagName }) => {
    if (this.props.editState) {
      this.props.detachTagFromTransaction({
        tagId: this.props.initialTags.find(tag => tag.name === tagName).id,
        tagName,
        transactionId: this.props.transactionId,
      });
    }

    this.setState(prevState => ({
      tags: prevState.tags.filter(tagInState => tagInState !== tagName),
    }));
  }

  setValuesAndSubmit = e => {
    const { handleSubmit, setValues, values } = this.props;
    const { positiveAmount, tags } = this.state;

    new Promise(resolve => {
      setValues({
        amount: (positiveAmount ? '+' : '-') + values.amount.replace(/\$|,|-/g, ''),
        description: values.description,
        date: dateToYMD(values.date),
        tags,
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
      isAddingTransaction,
      onCancel,
      setTouched,
      touched,
      transactionId,
      values,
    } = this.props;

    const { positiveAmount, showTagForm, tags } = this.state;

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
                      onClick={() => { this.toggleStateBool('positiveAmount'); }}
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

              <Form.Field className='margin-top-10'>
                <div className='inline-block full-width'>
                  {tags && tags.length > 0 &&
                    tags.map(tag => (
                      <TagButton
                        key={tag}
                        onDelete={this.removeTag}
                        onEdit={this.editTag}
                        tagName={tag}
                      />
                    ))
                  }
                  {showTagForm ?
                    <div className='tag-form forty-percent-width inline-block'>
                      <TagForm
                        onCancel={() => this.toggleStateBool('showTagForm')}
                        onSave={this.addTag}
                        transactionId={transactionId}
                      />
                    </div> :
                    <TagAdd
                      onClick={() => this.toggleStateBool('showTagForm')}
                    />
                  }
                </div>
              </Form.Field>

              <div>
                <Button
                  className={`trans-cta-button ${editState ? 'info-button' : 'success-button'}`}
                  content={editState ? 'Edit' : 'Add'}
                  disabled={allFieldsTouched(touched, fields) && anyErrorsPresent(errors)}
                  loading={isAddingTransaction}
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
      if (props.editState) {
        props.updateTransaction({ ...values, id: props.transactionId });
      } else {
        props.createTransaction({ ...values });
      }
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
  isAddingTransaction: state.transactions.boolEvents.isAddingTransaction,
});

const mapDispatchToProps = dispatch => ({
  attachTagToTransaction: data => dispatch(attachTagToTransaction(data)),
  createTransaction: data => dispatch(createTransaction(data)),
  detachTagFromTransaction: data => dispatch(detachTagFromTransaction(data)),
  modifyTransactionTag: data => dispatch(modifyTransactionTag(data)),
  updateTransaction: data => dispatch(updateTransaction(data)),
});

export { TransForm as BaseTransForm };
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withFormik(formikOptions)
)(TransForm);
