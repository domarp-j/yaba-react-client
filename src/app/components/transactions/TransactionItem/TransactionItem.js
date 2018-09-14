import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, Table, Button, Modal, Header } from 'semantic-ui-react';
import { connect } from 'react-redux';

import AddTag from '../../tags/AddTag';
import Tag from '../../tags/Tag';
import TagForm from '../../tags/TagForm';
import {
  deleteTransaction,
  toggleEditState
} from '../../../store/actions/transactions';
import {
  attachTagToTransaction,
  detachTagFromTransaction,
  modifyTransactionTag
} from '../../../store/actions/transactionTags';

import './TransactionItem.css';

class TransactionItem extends React.Component {
  static propTypes = {
    amount: PropTypes.string,
    attachTagToTransaction: PropTypes.func,
    date: PropTypes.string,
    deleteTransaction: PropTypes.func,
    description: PropTypes.string,
    detachTagFromTransaction: PropTypes.func,
    modifyTransactionTag: PropTypes.func,
    tags: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      description: PropTypes.string,
    })),
    toggleEditState: PropTypes.func,
    transactionId: PropTypes.number,
  }

  constructor() {
    super();
    this.state = {
      isActive: false,
      openModal: false,
      showAddTag: false,
    };
  }

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
  }

  setEditMode = () => {
    this.props.toggleEditState({
      amount: this.props.amount,
      id: this.props.transactionId,
      description: this.props.description,
      date: this.props.date,
      tags: this.props.tags,
    }, true);
  }

  removeTransactionItem = async () => {
    this.props.deleteTransaction(this.props.transactionId);
    this.toggleStateBool('openModal');
  }

  removeTransactionModal = () => (
    <Modal
      className='cancel-modal'
      open={this.state.openModal}
      trigger={<Button content='Delete' color='red' onClick={() => this.toggleStateBool('openModal')} />}
    >
      <Header icon='archive' content='Are you sure you want to delete this transaction?' />
      <Modal.Content>
        <p>
          This action is permanent. You will not be able to recover this transaction if you delete it.
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' onClick={() => this.toggleStateBool('openModal')}>
          No, keep it
        </Button>
        <Button color='red' onClick={this.removeTransactionItem}>
          Yes, delete it
        </Button>
      </Modal.Actions>
    </Modal>
  )

  render() {
    const {
      amount,
      attachTagToTransaction,
      date,
      description,
      detachTagFromTransaction,
      modifyTransactionTag,
      tags,
      transactionId,
    } = this.props;

    const { showAddTag } = this.state;

    return (
      <Accordion fluid styled>
        {/* Transaction information */}
        <Accordion.Title active={this.state.isActive} onClick={() => this.toggleStateBool('isActive')}>
          <Table celled striped>
            <Table.Body>
              <Table.Row>
                <Table.Cell width={3}>{date}</Table.Cell>
                <Table.Cell width={10}>
                  <div className='transaction-description'>{description}</div>
                </Table.Cell>
                <Table.Cell width={3}>
                  <div className='transaction-amount'>{amount}</div>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Accordion.Title>

        {/* Transaction tags & CTAs */}
        <Accordion.Content active={this.state.isActive}>
          <div className='tags'>
            {/* Transaction tags */}
            {tags && tags.length > 0 && tags.map(tag => (
              <Tag
                key={`${transactionId}-${tag.id}`}
                onDelete={() => (
                  detachTagFromTransaction({
                    tagId: tag.id,
                    tagName: tag.name,
                    transactionId: transactionId,
                  })
                )}
                onEdit={modifyTransactionTag}
                tagId={tag.id}
                tagName={tag.name}
                transactionId={transactionId}
              />
            ))}

            {/* Input to add new tag */}
            {showAddTag &&
              <TagForm
                onCancel={() => this.toggleStateBool('showAddTag')}
                onSubmit={attachTagToTransaction}
                transactionId={transactionId}
              />
            }

            {/* TODO: Loader that shows while add-tag call is being processed */}
            {/* {isAddingTag && <Button className='tag-loader' loading />} */}

            {/* Button that, when clicked, displays input to add new tag */}
            {!showAddTag &&
              <AddTag
                onClick={() => this.toggleStateBool('showAddTag')}
              />
            }
          </div>
          <div>
            {/* Edit transaction button */}
            <Button content='Edit' color='blue' onClick={this.setEditMode} />

            {/* Delete transaction button */}
            {this.removeTransactionModal()}
          </div>
        </Accordion.Content>
      </Accordion>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  attachTagToTransaction: data => dispatch(attachTagToTransaction(data)),
  deleteTransaction: id => dispatch(deleteTransaction(id)),
  detachTagFromTransaction: data => dispatch(detachTagFromTransaction(data)),
  modifyTransactionTag: data => dispatch(modifyTransactionTag(data)),
  toggleEditState: (transaction, editMode) => dispatch(toggleEditState(transaction, editMode)),
});

export default connect(undefined, mapDispatchToProps)(TransactionItem);
