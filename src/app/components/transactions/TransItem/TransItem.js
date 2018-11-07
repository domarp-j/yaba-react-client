import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Header, Icon, Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';

import TagAdd from '../../tags/TagAdd';
import TagButton from '../../tags/TagButton';
import TagForm from '../../tags/TagForm';
import TransForm from '../TransForm';
import {
  deleteTransaction,
  toggleEditState
} from '../../../store/actions/transactions';
import {
  attachTagToTransaction,
  detachTagFromTransaction,
  modifyTransactionTag
} from '../../../store/actions/tags';
import { dollarToFloat, floatToDollar } from '../../../utils/dollarTools';

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
      openDeleteModal: false,
      openEditModal: false,
      showTagForm: false,
      showCTAs: false,
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
    this.toggleStateBool('openDeleteModal');
  }

  editTransactionModal = () => (
    <Modal
      className='yaba-modal'
      open={this.state.openEditModal}
      trigger={
        <Button
          className='trans-cta-button'
          content='Edit'
          color='blue'
          onClick={() => this.toggleStateBool('openEditModal')}
        />
      }
    >
      <TransForm
        editState
        initialValues={{
          amount: this.props.amount,
          date: this.props.date,
          description: this.props.description,
        }}
        onCancel={() => this.toggleStateBool('openEditModal')}
        onSave={() => this.toggleStateBool('openEditModal')}
        transactionId={this.props.transactionId}
      />
    </Modal>
  )

  removeTransactionModal = () => (
    <Modal
      className='yaba-modal'
      open={this.state.openDeleteModal}
      trigger={
        <Button
          className='trans-cta-button'
          content='Delete'
          color='red'
          onClick={() => this.toggleStateBool('openDeleteModal')}
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
        <Button color='blue' onClick={() => this.toggleStateBool('openDeleteModal')}>
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

    const { showCTAs, showTagForm } = this.state;

    const amountFloat = dollarToFloat(amount);

    return (
      <Card
        className={`trans-item margin-bottom-5-mobile amount-${amountFloat >= 0 ? 'pos' : 'neg'}`}
        raised
      >
        <Card.Content>
          <Card.Header className='trans-header'>
            <div className='float-left'>{date}</div>
            <div className='float-right'>
              {floatToDollar(Math.abs(amountFloat))} {amountFloat >= 0 ?
                <Icon name='arrow circle up' className='amount-pos-icon no-margin' /> :
                <Icon name='arrow circle down' className='amount-neg-icon no-margin' />
              }
            </div>
          </Card.Header>
          <Card.Description className={`trans-description ${showCTAs ? 'margin-bottom-15' : ''}`}>
            {description}
          </Card.Description>
          <div className={`inline-block ${!showCTAs ? 'margin-top-15' : ''}`}>
            {tags && tags.length > 0 &&
              tags.map(tag => (
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
              ))
            }
          </div>
          {showCTAs &&
            <React.Fragment>
              <div className='inline-block'>
                {showTagForm ?
                  <TagForm
                    onCancel={() => this.toggleStateBool('showTagForm')}
                    onSubmit={attachTagToTransaction}
                    transactionId={transactionId}
                  /> :
                  <TagAdd
                    onClick={() => this.toggleStateBool('showTagForm')}
                  />
                }
              </div>
              <div className='margin-top-5'>
                {this.editTransactionModal()}
                {this.removeTransactionModal()}
              </div>
            </React.Fragment>
          }
        </Card.Content>
        <Button
          className='show-cta-button'
          icon={`angle ${showCTAs ? 'up' : 'down'}`}
          onClick={() => this.toggleStateBool('showCTAs')}
        />
      </Card>
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
