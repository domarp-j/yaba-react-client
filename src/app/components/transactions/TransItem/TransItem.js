import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Header, Icon, Modal, Popup as SemPopup } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { CompositeDecorator, ContentState, Editor, EditorState } from 'draft-js';
import { symmetricDifference } from 'ramda';

import { AmountInput, DatePicker } from '../../misc';
import {
  createTransaction,
  deleteTransaction,
  updateTransaction
} from '../../../store/actions/transactions';
import { addTagNameToTransactionQuery } from '../../../store/actions/queries';
import {
  attachTagToTransaction,
  detachTagFromTransaction,
  modifyTransactionTag
} from '../../../store/actions/tags';
import { dollarToFloat } from '../../../utils/dollarTools';
import { currentDateYMD } from '../../../utils/dateTools';

class TransItem extends React.Component {
  static propTypes = {
    amount: PropTypes.string,
    addTagNameToTransactionQuery: PropTypes.func,
    attachTagToTransaction: PropTypes.func,
    createTransaction: PropTypes.func,
    date: PropTypes.string,
    deleteTransaction: PropTypes.func,
    description: PropTypes.string,
    detachTagFromTransaction: PropTypes.func,
    modifyTransactionTag: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })),
    transactionId: PropTypes.number,
    updateTransaction: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.compositeDecorator = new CompositeDecorator([{
      strategy: this.tagStrategy,
      component: this.TagSpan,
    }]);

    this.state = {
      editorState: EditorState.createWithContent(
        ContentState.createFromText(props.description),
        this.compositeDecorator
      ),
      editAmount: undefined,
      positiveAmount: dollarToFloat(props.amount) >= 0,
      showAmountPopup: false,
      showDeleteModal: false,
      showDatePopup: false,
    };

    this.amountPopupRef = undefined;
    this.datePopupRef = undefined;

    this.amountTimeout = undefined;
    this.descTagTimeout = undefined;
  }

  /**
   * Regex that will be used to add custom styling to tags in description
   */
  tagRegex = /#([^\s]*)/g;

  /**
   * Delay between user changing description/tags and saving
   */
  saveDelay = 1200;

  /**
   * Keep track of mouse clicks so that amount & date popups can close as needed
   */
  componentDidMount() {
    window.addEventListener('mousedown', this.handleClickAroundPopup);
  }
  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handleClickAroundPopup);
  }

  /***************************************************************/
  /** STATE TOGGLERS */
  /***************************************************************/

  toggleDeleteModal = () => {
    this.setState(prevState => ({
      showDeleteModal: !prevState.showDeleteModal,
    }));
  }

  toggleDatePopup = () => {
    this.setState(prevState => ({
      showDatePopup: !prevState.showDatePopup,
    }));
  }
  toggleAmountPopup = () => {
    this.setState(prevState => ({
      showAmountPopup: !prevState.showAmountPopup,
    }));
  }

  /**
   * Toggle positiveAmount, which determines the sign shown on the amount edit popup
   * On toggle, make an external call to update the transaction's amount with a flipped sign
   */
  togglePositiveAmount = () => {
    this.setState(prevState => ({
      positiveAmount: !prevState.positiveAmount,
    }), () => {
      const absAmount = this.props.amount.replace(/\$|,|-/g, '');
      const sign = this.state.positiveAmount ? '+' : '-';
      this.updateTransaction({
        amount: `${sign}${absAmount}`,
      });
    });
  }

  /***************************************************************/
  /** STRATEGIES (DRAFT-JS) */
  /***************************************************************/

  /**
   * Strategy used to decorate tags (for draft-js)
   */
  tagStrategy = (contentBlock, callback) => {
    const text = contentBlock.getText();
    let matchArr, start;
    while ((matchArr = this.tagRegex.exec(text)) !== null) {
      start = matchArr.index;
      callback(start, start + matchArr[0].length);
    }
  }

  /***************************************************************/
  /** REF SETTERS */
  /***************************************************************/

  /**
   * Set ref using the provided element
   */
  setAmountPopupRef = ele => {
    this.amountPopupRef = ele;
  };

  /**
   * Set ref using the provided element
   */
  setDatePopupRef = ele => {
    this.datePopupRef = ele;
  };

  /***************************************************************/
  /** SERVER-SIDE TRANSACTION MODIFIERS */
  /***************************************************************/

  /**
   * Wrapper around updateTransaction dispatch function
   */
  updateTransaction = newValues => {
    this.props.updateTransaction({
      id: this.props.transactionId,
      newValues,
      previousValues: {
        amount: this.props.amount,
        date: this.props.date,
        description: this.props.description,
      },
    });
  }

  /**
   * Save the transaction's new description, trimming trailing whitespace as needed.
   */
  saveTransactionDescription = text => {
    this.updateTransaction({ description: text.trim() });
  }

  /**
   * Clear out ALL transactions tags if any tags have been modified.
   * This is the safest way to ensure that tags that should be removed are not accidentally persisted in the server somehow.
   * TODO: Find a smarter way to check for changes in tags.
   */
  clearTransactionTags = () => {
    const promises = this.props.tags.map(tag => (
      this.props.detachTagFromTransaction({
        tagId: tag.id,
        tagName: tag.name,
        transactionId: this.props.transactionId,
      })
    ));

    return Promise.all(promises);
  }

  /**
   * Update transaction's tags if they have changed.
   * TODO: This, along with clearTransactionTags, could be optimized.
   */
  updateTransactionTags = async text => {
    // Clear out all transaction tags if no #tags are present
    if (!text.match(this.tagRegex)) {
      await this.clearTransactionTags();
      return;
    }

    // Check if user has changed any tags in the description
    // Return if tags have not changed
    const currentTagNames = this.props.tags.map(tag => tag.name);
    const newTagNames = text.match(this.tagRegex).map(tag => tag.replace(/#/, ''));
    if (!symmetricDifference(currentTagNames, newTagNames).length) return;

    // Clear out existing transaction tags and attach new tags
    await this.clearTransactionTags();
    newTagNames.map(tag => {
      this.props.attachTagToTransaction({
        tagName: tag,
        transactionId: this.props.transactionId,
      });
    });
  }

  /**
   * Update transaction amount using current positiveAmount bool & editAmount value in state
   */
  updateTransactionAmount = () => {
    const { editAmount, positiveAmount } = this.state;
    this.updateTransaction({ amount: `${positiveAmount ? '+' : '-'}${editAmount.replace(/\$|,|-/g, '')}` });
  }

  /**
   * Create a near-duplicate transaction with the same description, value, and tags. The date will be set to the current date.
   */
  cloneTransaction = () => {
    this.props.createTransaction({
      amount:  (dollarToFloat(this.props.amount) > 0 ? '+' : '-') + this.props.amount.replace(/\$|,|-/g, ''),
      description: this.props.description,
      date: currentDateYMD(),
      tags: this.props.tags.map(tag => tag.name),
    });
    window.scrollTo(0, 0);
  }

  /***************************************************************/
  /** EVENT HANDLERS */
  /***************************************************************/

  /**
   * Handle clicks outside of date & amount popups
   * Make sure that popups close on click-away
   */
  handleClickAroundPopup = e => {
    if (this.amountPopupRef && !this.amountPopupRef.contains(e.target)) {
      this.setState({ showAmountPopup: false });
    }

    if (this.datePopupRef && !this.datePopupRef.contains(e.target)) {
      this.setState({ showDatePopup: false });
    }
  }

  /**
   * On change, look for changes in the transaction description & tags.
   * Autosave descriptions and tags if they have been modified.
   */
  handleDescTagChange = editorState => {
    if (this.descTagTimeout) {
      clearTimeout(this.descTagTimeout);
    }

    this.setState({ editorState }, () => {
      this.descTagTimeout = setTimeout(() => {
        const text = this.state.editorState.getCurrentContent().getPlainText();
        this.saveTransactionDescription(text);
        this.updateTransactionTags(text);
      }, this.saveDelay);
    });
  }

  /**
   * When editing the amount, delay for a bit before saving
   */
  handleAmountChange = e => {
    if (this.dateTimeout) {
      clearTimeout(this.dateTimeout);
    }

    this.setState({ editAmount: e.target.value }, () => {
      this.dateTimeout = setTimeout(() => {
        this.updateTransactionAmount();
      }, this.saveDelay);
    });
  }

  /**
   * When focusing away from the amount field, save immediately
   */
 handleAmountBlur = () => {
   this.updateTransactionAmount();
 }

  /**
   * This function converts a Date object into YYYY-MM-DD format, since that is the most common format used throughout the app.
   * It subsequently updates the transaction based on this new date.
   */
  handleDatePickerClick = async date => {
    const month = date.getMonth() + 1;
    const paddedMonth = month < 10 ? `0${month}` : month;
    const day = date.getDate();
    const paddedDay = day < 10 ? `0${day}` : day;
    const year = date.getFullYear();
    const dateYMD = `${year}-${paddedMonth}-${paddedDay}`;

    await this.updateTransaction({ date: dateYMD });
    this.toggleDatePopup();
  };

  /**
   * On tag click, add the clicked tag to the list of transaction queries
   */
  handleTagSpanClick = tagSpanProps => {
    const tagName = tagSpanProps.decoratedText.replace(/#/, '');
    this.props.addTagNameToTransactionQuery(tagName);
  }

  /***************************************************************/
  /** SUBCOMPONENTS */
  /***************************************************************/

  /**
   * Tag element & styling (for draft-js)
   */
  TagSpan = props => {
    return (
      <span
        {...props}
        className='transaction-tag'
        onClick={() => this.handleTagSpanClick(props)}>
        <Button>
          {props.children}
        </Button>
      </span>
    );
  }

  /**
   * When the Delete button is clicked for this transaction, display a modal asking for delete confirmation.
   * Once the user confirms that they want to delete the transaction, the delete request is called, and the modal is closed.
   */
  RemoveTransactionModal = () => (
    <Modal
      className='yaba-modal'
      open={this.state.showDeleteModal}
      trigger={
        <Button
          content='Delete'
          onClick={this.toggleDeleteModal}
        />
      }
    >
      <Header icon='archive' content='Are you sure you want to delete this transaction?' />
      <Modal.Content>
        <p>
          This action is permanent. You will not be able to recover this transaction if you delete it.
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button className='blue-button' onClick={this.toggleDeleteModal}>
          No, keep it
        </Button>
        <Button className='red-button' onClick={() => {
          this.props.deleteTransaction({
            amount: this.props.amount,
            date: this.props.date,
            description: this.props.description,
            id: this.props.transactionId,
          });
          this.toggleDeleteModal;
        }}>
          Yes, delete it
        </Button>
      </Modal.Actions>
    </Modal>
  )

  /**
   * Wrapper around Semantic UI's popup component so that common props are shared among all pop-ups.
   */
  Popup = ({ style, ...props }) => {
    let popupStyle = { boxShadow: 'none', zIndex: 0 };
    if (style) {
      popupStyle = { ...popupStyle, ...style };
    }

    return (
      <SemPopup
        keepInViewPort
        on='click'
        style={popupStyle}
        {...props}
      />
    );
  }

  /**
   * Wrapper around amount input
   */
  AmountEditor = ({ amount }) => (
    <AmountInput
      amount={amount}
      onChange={this.handleAmountChange}
      onSignClick={this.togglePositiveAmount}
      positiveAmount={this.state.positiveAmount}
    />
  )

  /**
   * Wrapper around date input and date picker, both of which can be used to edit a transaction.
   */
  DateEditor = ({ date }) => (
    <DatePicker
      month={new Date(date)}
      onDayClick={day => this.handleDatePickerClick(day)}
      showClose={false}
    />
  )

  /**
   * Options popup contents:
       1) Duplicate transaction
       2) Delete transaction
   */
  OptionsList = () => {
    const RemoveTransactionModal = this.RemoveTransactionModal;

    return (
      <Button.Group
        basic
        vertical
      >
        <Button
          content='Duplicate'
          onClick={this.cloneTransaction}
        />
        <RemoveTransactionModal />
      </Button.Group>
    );
  }

  /***************************************************************/
  /** RENDER */
  /***************************************************************/


  render() {
    const { amount, date } = this.props;
    const { showAmountPopup, showDatePopup } = this.state;

    const AmountEditor = this.AmountEditor;
    const DateEditor = this.DateEditor;
    const OptionsList = this.OptionsList;
    const Popup = this.Popup;

    return (
      <Card className='full-width no-margin-bottom' ref={this.setItemRef}>
        <Card.Content>
          <Card.Header className='transaction-description'>
            <Editor editorState={this.state.editorState} onChange={this.handleDescTagChange} />
          </Card.Header>
          <Card.Description className='transaction-date-amount'>
            <Popup
              content={<div ref={this.setDatePopupRef}><DateEditor date={date} /></div>}
              open={showDatePopup}
              position='bottom left'
              style={{ padding: '0' }}
              trigger={<span className='cursor-pointer' onClick={this.toggleDatePopup}>{date}</span>}
            /> | <Popup
              content={<div ref={this.setAmountPopupRef}><AmountEditor amount={amount} ref={this.setAmountPopupRef} /></div>}
              horizontalOffset={-8}
              open={showAmountPopup}
              position='bottom left'
              trigger={<span className='cursor-pointer' onClick={this.toggleAmountPopup}>
                {dollarToFloat(amount) >= 0 ?
                  <Icon name='arrow circle up' className='green-color no-margin' /> :
                  <Icon name='arrow circle down' className='red-color no-margin' />
                } {amount.replace(/-/, '')}
              </span>}
            />
            <div className='float-right'>
              <Popup
                content={<OptionsList />}
                horizontalOffset={8}
                position='bottom right'
                style={{ padding: '0' }}
                trigger={<Icon
                  className='cursor-pointer grey-light-color'
                  name='ellipsis horizontal'
                />}
              />
            </div>
          </Card.Description>
        </Card.Content>
      </Card>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  addTagNameToTransactionQuery: tagName => dispatch(addTagNameToTransactionQuery(tagName)),
  attachTagToTransaction: data => dispatch(attachTagToTransaction(data)),
  createTransaction: data => dispatch(createTransaction(data)),
  deleteTransaction: data => dispatch(deleteTransaction(data)),
  detachTagFromTransaction: data => dispatch(detachTagFromTransaction(data)),
  modifyTransactionTag: data => dispatch(modifyTransactionTag(data)),
  updateTransaction: data => dispatch(updateTransaction(data)),
});

export default connect(undefined, mapDispatchToProps)(TransItem);
