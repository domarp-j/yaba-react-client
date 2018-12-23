import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Header, Icon, Input, Modal, Popup as SemPopup } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { CompositeDecorator, ContentState, Editor, EditorState } from 'draft-js';
import { symmetricDifference } from 'ramda';

import { DatePicker } from '../../misc';
import { AmountInput } from '../../transactions';
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
import { currentDateYMD, dateToYMD } from '../../../utils/dateTools';
import { dollarToFloat } from '../../../utils/dollarTools';
import { isDraftjsEvent } from '../../../utils/draftjsTools';
import { tagRegex, tagStrategy } from '../../../utils/tagTools';

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
      strategy: tagStrategy,
      component: this.TagSpan,
    }]);

    this.state = {
      description: props.description,
      editorState: EditorState.createWithContent(
        ContentState.createFromText(props.description),
        this.compositeDecorator
      ),
      editAmount: undefined,
      positiveAmount: dollarToFloat(props.amount) >= 0,
      showAmountPopup: false,
      showDeleteModal: false,
      showDatePopup: false,
      showOptionsPopup: false,
    };

    this.amountPopupRef = undefined;
    this.datePopupRef = undefined;
    this.optionsPopupRef = undefined;

    this.amountTimeout = undefined;
    this.descTagTimeout = undefined;
  }

  /**
   * Regex to find dollar-based chars
   */
  dollarRegex = /\$|,|-/g;

  /**
   * Delay between user changing description/tags and saving
   */
  saveDelay = 1200;

  /***************************************************************/
  /** LIFECYCLE METHODS */
  /***************************************************************/

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

  toggleOptionsPopup = () => {
    this.setState(prevState => ({
      showOptionsPopup: !prevState.showOptionsPopup,
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
      const absAmount = this.props.amount.replace(this.dollarRegex, '');
      const sign = this.state.positiveAmount ? '+' : '-';
      this.updateTransaction({
        amount: `${sign}${absAmount}`,
      });
    });
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

  /**
   * Set ref using the provided element
   */
  setOptionsPopupRef = ele => {
    this.optionsPopupRef = ele;
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
    if (!text.match(tagRegex)) {
      await this.clearTransactionTags();
      return;
    }

    // Check if user has changed any tags in the description
    // Return if tags have not changed
    const currentTagNames = this.props.tags.map(tag => tag.name);
    const newTagNames = text.match(tagRegex).map(tag => tag.replace(/#/, ''));
    if (!symmetricDifference(currentTagNames, newTagNames).length) return;

    // Clear out existing transaction tags and attach new tags
    await this.clearTransactionTags();
    newTagNames.forEach(tag => {
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
    this.updateTransaction({
      amount: `${positiveAmount ? '+' : '-'}${editAmount.replace(this.dollarRegex, '')}`,
    });
  }

  /**
   * Create a near-duplicate transaction with the same description, value, and tags. The date will be set to the current date.
   */
  cloneTransaction = () => {
    const { amount } = this.props;

    this.props.createTransaction({
      amount:  `${dollarToFloat(amount) > 0 ? '+' : '-'}${amount.replace(this.dollarRegex, '')}`,
      description: this.props.description,
      date: currentDateYMD(),
      tags: this.props.tags.map(tag => tag.name),
    });

    window.scrollTo(0, 0);

    this.setState({ showOptionsPopup: false });
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

    /**
     * TODO: This currently breaks delete functionality. Fix it.
     */
    // if (this.optionsPopupRef && !this.optionsPopupRef.contains(e.target)) {
    //   this.setState({ showOptionsPopup: false });
    // }
  }

  /**
   * On change, look for changes in the transaction description & tags.
   * Autosave descriptions and tags if they have been modified.
   * Behaves differently depending on whether argument is either:
   * 1) An EditorState (for draft-js, which is used in desktop)
   * 2) A SyntheticEvent (for plain inputs, which are used in tablet/mobile)
   */
  handleDescTagChange = event => {
    if (this.descTagTimeout) {
      clearTimeout(this.descTagTimeout);
    }

    const usingDraftjs = isDraftjsEvent(event);
    const newState = usingDraftjs ? { editorState: event } : { description: event.target.value };

    this.setState(newState, () => {
      let text;
      if (usingDraftjs) {
        text = this.state.editorState.getCurrentContent().getPlainText();
      } else {
        text = this.state.description;
      }

      if (!this.isValidDescription(text)) return;

      this.descTagTimeout = setTimeout(() => {
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
    await this.updateTransaction({ date: dateToYMD(date) });
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
  /** UTILITY FUNCTIONS */
  /***************************************************************/

  isValidDescription = text => {
    // Invalid description if there is a stranded tag (# without followup chars)
    if (text.match(/#\s|#$/)) return false;

    return true;
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
          this.toggleDeleteModal();
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
    const { description, editAmount, showAmountPopup, showDatePopup, showOptionsPopup } = this.state;

    const AmountEditor = this.AmountEditor;
    const DateEditor = this.DateEditor;
    const OptionsList = this.OptionsList;
    const Popup = this.Popup;

    return (
      <Card className='full-width no-margin-bottom' ref={this.setItemRef}>
        <Card.Content>
          <Card.Header className='transaction-description'>
            {/*
              Display the draft-js editor on desktops
            */}
            <div className='hidden-tablet-and-mobile'>
              <Editor
                editorState={this.state.editorState}
                onChange={this.handleDescTagChange}
              />
            </div>
            {/*
              Display a plain-old input on smaller devices, since draft-js doesn't work on
              mobile browsers.
            */}
            <div className='tablet-and-mobile-only'>
              <Input
                className='transaction-description-mobile'
                onChange={this.handleDescTagChange}
                value={description}
              />
            </div>
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
                  <Icon name='arrow circle up' className='green-color no-margsin' /> :
                  <Icon name='arrow circle down' className='red-color no-margin' />
                } {editAmount || amount.replace(/-/, '')}
              </span>}
            />
            <div className='float-right'>
              <Popup
                content={<div ref={this.setOptionsPopupRef}><OptionsList /></div>}
                horizontalOffset={8}
                open={showOptionsPopup}
                position='bottom right'
                style={{ padding: '0' }}
                trigger={<Icon
                  className='cursor-pointer grey-light-color'
                  name='ellipsis horizontal'
                  onClick={this.toggleOptionsPopup}
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
