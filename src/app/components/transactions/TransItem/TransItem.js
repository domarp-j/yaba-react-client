import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, Table, Button, Modal, Header } from 'semantic-ui-react';
import { connect } from 'react-redux';

import TagAdd from '../../tags/TagAdd';
import TagButton from '../../tags/TagButton';
import TagForm from '../../tags/TagForm';
import {
  deleteTransaction,
  toggleEditState
} from '../../../store/actions/transactions';
import {
  attachTagToTransaction,
  detachTagFromTransaction,
  modifyTransactionTag
} from '../../../store/actions/tags';

class TransItem extends React.Component {
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
      showTagAdd: false,
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

  removeTransItem = async () => {
    this.props.deleteTransaction(this.props.transactionId);
    this.toggleStateBool('openModal');
  }

  removeTransactionModal = () => (
    <Modal
      className='yaba-modal'
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
        <Button color='red' onClick={this.removeTransItem}>
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

    const { showTagAdd } = this.state;

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
          <div className='transaction-tags'>
            {/* Transaction tags */}
            {tags && tags.length > 0 && tags.map(tag => (
              <TagButton
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
            {showTagAdd &&
              <TagForm
                onCancel={() => this.toggleStateBool('showTagAdd')}
                onSubmit={attachTagToTransaction}
                transactionId={transactionId}
              />
            }

            {/* TODO: Loader that shows while add-tag call is being processed */}
            {/* {isAddingTag && <Button className='tag-loader' loading />} */}

            {/* Button that, when clicked, displays input to add new tag */}
            {!showTagAdd &&
              <TagAdd
                onClick={() => this.toggleStateBool('showTagAdd')}
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

export default connect(undefined, mapDispatchToProps)(TransItem);
