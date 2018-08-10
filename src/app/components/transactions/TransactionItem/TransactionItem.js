import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, Table, Button, Modal, Header, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';

import TagForm from '../../tags/TagForm';
import { deleteTransaction, toggleEditState } from '../../../store/actions/transactions';
import './TransactionItem.css';

class TransactionItem extends React.Component {
  constructor() {
    super();
    this.state = {
      isActive: false,
      openModal: false,
      addingTag: false,
    };
  }

  toggleClick = () => {
    this.setState(prevState => {
      return {
        isActive: !prevState.isActive,
      };
    });
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

  openModal = () => this.setState({ openModal: true })

  closeModal = () => this.setState({ openModal: false })

  showTagForm = () => this.setState({ addingTag: true })

  hideTagForm = () => this.setState({ addingTag: false })

  removeTransactionItem = async () => {
    this.props.deleteTransaction(this.props.transactionId);
    this.closeModal();
  }

  addTagButton = () => (
    <Button className='margin=bottom-4' onClick={this.showTagForm}>
      <Button.Content className='no-padding'>
        <Icon name='plus' className='no-margin' />
      </Button.Content>
    </Button>
  )

  removeTransactionModal = () => (
    <Modal
      className='cancel-modal'
      open={this.state.openModal}
      trigger={<Button content='Delete' color='red' onClick={this.openModal} />}
    >
      <Header icon='archive' content='Are you sure you want to delete this transaction?' />
      <Modal.Content>
        <p>
          This action is permanent. You will not be able to recover this transaction if you delete it.
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button color='blue' onClick={this.closeModal}>
          No, keep it
        </Button>
        <Button color='red' onClick={this.removeTransactionItem}>
          Yes, delete it
        </Button>
      </Modal.Actions>
    </Modal>
  )

  render() {
    const { amount, date, description, tags, transactionId } = this.props;
    const { addingTag } = this.state;

    return (
      <Accordion fluid styled>
        <Accordion.Title active={this.state.isActive} onClick={this.toggleClick}>
          <Table celled striped>
            <Table.Body>
              <Table.Row>
                <Table.Cell width={3}>{date}</Table.Cell>
                <Table.Cell width={10}>{description}</Table.Cell>
                <Table.Cell width={3}>{amount}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Accordion.Title>
        <Accordion.Content active={this.state.isActive}>
          {tags && tags.length > 0 &&
            <div className='tags'>
              {tags.map(tag => <Button key={tag.id} content={tag.name} className='tag' />)}
              {addingTag && <TagForm handleCancel={this.hideTagForm} transactionId={transactionId} />}
              {!addingTag && this.addTagButton()}
            </div>
          }
          <div>
            <Button content='Edit' color='blue' onClick={this.setEditMode} />
            {this.removeTransactionModal()}
          </div>
        </Accordion.Content>
      </Accordion>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  deleteTransaction: id => { dispatch(deleteTransaction(id)); },
  toggleEditState: (transaction, editMode) => { dispatch(toggleEditState(transaction, editMode)); },
});


TransactionItem.propTypes = {
  amount: PropTypes.string,
  date: PropTypes.string,
  deleteTransaction: PropTypes.func,
  description: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
  })),
  toggleEditState: PropTypes.func,
  transactionId: PropTypes.number,
};

export default connect(null, mapDispatchToProps)(TransactionItem);
