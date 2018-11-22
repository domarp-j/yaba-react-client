import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Header, Icon, Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { TagAdd, TagButton, TagForm } from '../../tags';
import TransForm from '../TransForm';
import { deleteTransaction } from '../../../store/actions/transactions';
import { addTagNameToTransactionQuery } from '../../../store/actions/queries';
import {
  attachTagToTransaction,
  detachTagFromTransaction,
  modifyTransactionTag
} from '../../../store/actions/tags';
import { dollarToFloat, floatToDollar } from '../../../utils/dollarTools';

class TransItem extends React.Component {
  static propTypes = {
    amount: PropTypes.string,
    addTagNameToTransactionQuery: PropTypes.func,
    attachTagToTransaction: PropTypes.func,
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
  }

  constructor() {
    super();
    this.state = {
      editMode: false,
      openDeleteModal: false,
      showEditDelete: false,
      showTagForm: false,
    };
  }

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
  }

  /*
    If a tag is clicked and the transaction is NOT showing Edit/Delete
    buttons, then add that tag to the transaction filter queries.
  */
  handleTagButtonClick = ({ tagName }) => {
    if (!this.state.showEditDelete) {
      this.props.addTagNameToTransactionQuery(tagName);
    }
  }

  /*
    When the Delete button is clicked for this transaction,
    display a modal asking for delete confirmation.
    Once the user confirms that they want to delete the transaction,
    the delete request is called, and the modal is closed.
  */
  removeTransactionModal = () => (
    <Modal
      className='yaba-modal'
      open={this.state.openDeleteModal}
      trigger={
        <Button
          className='trans-cta-button error-button'
          content='Delete'
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
        <Button className='info-button' onClick={() => this.toggleStateBool('openDeleteModal')}>
          No, keep it
        </Button>
        <Button className='error-button' onClick={() => {
          this.props.deleteTransaction({
            amount: this.props.amount,
            date: this.props.date,
            description: this.props.description,
            id: this.props.transactionId,
          });
          this.toggleStateBool('openDeleteModal');
        }}>
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

    const { editMode, showEditDelete, showTagForm } = this.state;

    const amountFloat = dollarToFloat(amount);

    return (
      editMode ?
        <TransForm
          editState
          initialTags={tags}
          initialValues={{
            amount,
            date,
            description,
          }}
          onCancel={() => this.toggleStateBool('editMode')}
          onSave={() => this.toggleStateBool('editMode')}
          transactionId={transactionId}
        /> :
        <Card
          className={`yaba-card trans-item margin-bottom-5-mobile amount-${amountFloat >= 0 ? 'pos' : 'neg'}`}
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
            <Card.Description className={`trans-description ${showEditDelete ? 'margin-bottom-15' : ''}`}>
              {description}
            </Card.Description>
            <div className={`inline-block ${!showEditDelete ? 'margin-top-15' : ''}`}>
              {tags && tags.length > 0 &&
                tags.map(tag => (
                  <TagButton
                    className='inline-block'
                    editable={showEditDelete}
                    key={`${transactionId}-${tag.id}`}
                    onClick={this.handleTagButtonClick}
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
              {showEditDelete &&
                <div className='inline-block'>
                  {showTagForm ?
                    <TagForm
                      onCancel={() => this.toggleStateBool('showTagForm')}
                      onSave={attachTagToTransaction}
                      transactionId={transactionId}
                    /> :
                    <TagAdd
                      onClick={() => this.toggleStateBool('showTagForm')}
                    />
                  }
                </div>
              }
            </div>
            {showEditDelete &&
              <div className='margin-top-5'>
                <Button
                  className='trans-cta-button info-button'
                  content='Edit'
                  onClick={() => this.toggleStateBool('editMode')}
                />
                {this.removeTransactionModal()}
              </div>
            }
          </Card.Content>
          <Button
            className='show-cta-button'
            icon={`angle ${showEditDelete ? 'up' : 'down'}`}
            onClick={() => this.toggleStateBool('showEditDelete')}
          />
        </Card>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  addTagNameToTransactionQuery: tagName => dispatch(addTagNameToTransactionQuery(tagName)),
  attachTagToTransaction: data => dispatch(attachTagToTransaction(data)),
  deleteTransaction: data => dispatch(deleteTransaction(data)),
  detachTagFromTransaction: data => dispatch(detachTagFromTransaction(data)),
  modifyTransactionTag: data => dispatch(modifyTransactionTag(data)),
});

export default connect(undefined, mapDispatchToProps)(TransItem);
