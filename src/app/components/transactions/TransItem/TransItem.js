import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  Header,
  Icon,
  Modal,
  Popup as SemPopup,
  TextArea
} from 'semantic-ui-react';
import { connect } from 'react-redux';
import { symmetricDifference } from 'ramda';

import { DatePicker } from '../../misc';
import { TagDropdown } from '../../tags';
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
  fetchTags,
  modifyTransactionTag
} from '../../../store/actions/tags';
import { currentDateYMD, dateToYMD } from '../../../utils/dateTools';
import { dollarToFloat } from '../../../utils/dollarTools';
import {
  extractTags,
  tagRegex
} from '../../../utils/tagTools';

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
    fetchTags: PropTypes.func,
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

    this.state = {
      description: props.description,
      editAmount: undefined,
      filterData: {},
      positiveAmount: dollarToFloat(props.amount) >= 0,
      showDeleteModal: false,
    };

    this.amountTimeout = undefined;
    this.descTagTimeout = undefined;
  }

  /**
   * Regex to find dollar-based chars
   */
  DOLLAR_REGEX = /\$|,|-/g;

  /**
   * Delay between user changing description/tags and saving
   */
  SAVE_DELAY = 1750;

  /***************************************************************/
  /** STATE TOGGLERS */
  /***************************************************************/

  toggleDeleteModal = () => {
    this.setState(prevState => ({
      showDeleteModal: !prevState.showDeleteModal,
    }));
  }

  /**
   * Toggle positiveAmount, which determines the sign shown on the amount edit popup
   * On toggle, make an external call to update the transaction's amount with a flipped sign
   */
  togglePositiveAmount = () => {
    if (this.amountTimeout) {
      clearTimeout(this.amountTimeout);
    }

    this.setState(prevState => ({
      positiveAmount: !prevState.positiveAmount,
    }), () => {
      this.amountTimeout = setTimeout(() => {
        const amount = this.state.editAmount || this.props.amount;
        const absAmount = amount.replace(this.DOLLAR_REGEX, '');
        const sign = this.state.positiveAmount ? '+' : '-';
        this.updateTransaction({ amount: `${sign}${absAmount}` });
      }, this.SAVE_DELAY);
    });
  }

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
   * TODO: Find a smarter way to check for changes in tags?
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

    // Fetch all tags & save in global state
    this.props.fetchTags();
  }

  /**
   * Update transaction amount using current positiveAmount bool & editAmount value in state
   */
  updateTransactionAmount = () => {
    const { editAmount, positiveAmount } = this.state;
    this.updateTransaction({
      amount: `${positiveAmount ? '+' : '-'}${editAmount.replace(this.DOLLAR_REGEX, '')}`,
    });
  }

  /**
   * Create a near-duplicate transaction with the same description, value, and tags. The date will be set to the current date.
   */
  cloneTransaction = () => {
    const { amount } = this.props;

    this.props.createTransaction({
      amount:  `${dollarToFloat(amount) > 0 ? '+' : '-'}${amount.replace(this.DOLLAR_REGEX, '')}`,
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
   * On change, look for changes in the transaction description & tags.
   * Autosave descriptions and tags if they have been modified.
   */
  handleDescChange = e => {
    if (this.descTagTimeout) {
      clearTimeout(this.descTagTimeout);
    }

    this.setState({
      description: e.target.value,
      filterData: this.getFilterData(e),
    }, () => {
      const { description } = this.state;
      if (!this.isValidDescription(description)) return;
      this.descTagTimeout = setTimeout(() => {
        this.saveTransactionDescription(description);
        this.updateTransactionTags(description);
      }, this.SAVE_DELAY);
    });
  }

  /**
   * When editing the amount, delay for a bit before saving
   */
  handleAmountChange = e => {
    if (this.amountTimeout) {
      clearTimeout(this.amountTimeout);
    }

    this.setState({ editAmount: e.target.value }, () => {
      this.amountTimeout = setTimeout(() => {
        this.updateTransactionAmount();
      }, this.SAVE_DELAY);
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
  };

  /**
   * On tag button click, add the clicked tag to the list of transaction queries
   */
  handleTagButtonClick = tagName => {
    this.props.addTagNameToTransactionQuery(tagName);
  }

  /**
   * When clicking a tag dropdown option, update the description with the selected
   * tag based on the filterData in state
   */
  handleTagDropdownClick = tagName => {
    const { position } = this.state.filterData;

    const descBeforePos = this.state.description.slice(0, position);
    const descAfterPos = this.state.description.slice(position);

    const splitDescAfterPos = descAfterPos.split(/\s/);
    splitDescAfterPos[0] = `#${tagName}`;
    const newDescAfterPos = splitDescAfterPos.join(' ');

    this.setState({
      description: `${descBeforePos}${newDescAfterPos}`,
      filterData: {},
    }, () => {
      const { description } = this.state;
      this.saveTransactionDescription(description);
      this.updateTransactionTags(description);
      if (this.descTagTimeout) {
        clearTimeout(this.descTagTimeout);
      }
    });
  }

  /***************************************************************/
  /** UTILITY FUNCTIONS */
  /***************************************************************/

  isValidDescription = text => {
    // Invalid description if there is a stranded tag (# without followup chars)
    if (text.match(/#\s|#$/)) return false;

    return true;
  }

  /**
   * If the cursor in the description field is close to a #tag,
   * return data on that tag that could be used for the tag
   * dropdown filter:
   * {
   *   text: The text of the tag near the cursor,
   *   position: Position of the tag (0 - all the way to the left)
   * }
   * Return an empty object if the cursor is not near an object
   */
  getFilterData = event => {
    let desc = event.target.value;

    // Return empty object if no tags are present in description or
    // if description is empty
    if (!desc.match(/#/) || desc === '') return {};
    // Return empty object if a range of text is selected
    if (event.target.selectionStart !== event.target.selectionEnd) {
      return {};
    }

    let caretPosition = event.target.selectionStart;
    let currPosition = caretPosition;

    // Return empty object if caret is at beginning of description field
    if (currPosition === 0) return {};

    // Find the first space or '#' to the left of the caret
    while (!desc[currPosition - 1].match(/\s|#/)) currPosition--;

    // Return filter data if the caret is near a #tag
    if (desc[currPosition - 1].match(/#/)) {
      return {
        text: desc.slice(currPosition - 1).split(/\s/)[0].replace(/#/, ''),
        position: currPosition - 1,
      };
    }

    // Return empty objects if the character to the left of the caret is a
    // space, implying that the caret is not near a #tag
    return {};
  }

  setTransItemRef = ele => {
    this.transItemRef = ele;
  };

  /***************************************************************/
  /** SUBCOMPONENTS */
  /***************************************************************/

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
    const { description, editAmount, filterData, positiveAmount } = this.state;

    const AmountEditor = this.AmountEditor;
    const DateEditor = this.DateEditor;
    const OptionsList = this.OptionsList;
    const Popup = this.Popup;

    return (
      <Card className='full-width no-margin-bottom'>
        <Card.Content>
          <Card.Header>
            <TextArea
              autoHeight
              className='transaction-description-textarea'
              onChange={this.handleDescChange}
              rows={1}
              style={{ minHeight: 23 }}
              value={description}
            />
            {filterData.text &&
              <TagDropdown
                className='position-absolute'
                filterText={filterData.text}
                onSelect={this.handleTagDropdownClick}
                ref={this.setPageRef}
              />
            }
            {extractTags(description).map(tag => (
              <Button
                className='tag-button'
                key={tag}
                onClick={() => this.handleTagButtonClick(tag)}
              >
                {tag}
              </Button>
            ))}
          </Card.Header>
          <Card.Description className='transaction-date-amount'>
            <Popup
              content={<DateEditor date={date} />}
              position='bottom left'
              style={{ padding: '0' }}
              trigger={<span className='cursor-pointer' >{date}</span>}
            /> | <Popup
              content={<AmountEditor amount={amount} />}
              horizontalOffset={-8}
              position='bottom left'
              trigger={<span className='cursor-pointer'>
                {positiveAmount ?
                  <Icon name='arrow circle up' className='green-color no-margsin' /> :
                  <Icon name='arrow circle down' className='red-color no-margin' />
                } {editAmount || amount.replace(/-/, '')}
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
  fetchTags: () => dispatch(fetchTags()),
  modifyTransactionTag: data => dispatch(modifyTransactionTag(data)),
  updateTransaction: data => dispatch(updateTransaction(data)),
});

export default connect(null, mapDispatchToProps)(TransItem);
