import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Header, Icon, Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { TagAdd, TagButton, TagForm } from '../../tags';
import TransForm from '../TransForm';
import { deleteTransaction } from '../../../store/actions/transactions';
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
    transactionId: PropTypes.number,
  }

  constructor() {
    super();
    this.state = {
      editMode: false,
      isActive: false,
      openDeleteModal: false,
      showTagForm: false,
      showCTAs: false,
    };
  }

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
  }

  removeTransItem = async () => {
    this.props.deleteTransaction(this.props.transactionId);
    this.toggleStateBool('openDeleteModal');
  }

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
        <Button className='error-button' onClick={this.removeTransItem}>
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

    const { editMode, showCTAs, showTagForm } = this.state;

    const amountFloat = dollarToFloat(amount);

    return (
      editMode ?
        <TransForm
          editState
          initialValues={{
            amount: amount,
            date: date,
            description: description,
          }}
          onCancel={() => this.toggleStateBool('editMode')}
          onSave={() => this.toggleStateBool('editMode')}
          transactionId={transactionId}
        /> :
        <Card
          className={`yaba-card trans-item margin-bottom-5-mobile amount-${amountFloat >= 0 ? 'pos' : 'neg'}`}
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
                      onSave={attachTagToTransaction}
                      transactionId={transactionId}
                    /> :
                    <TagAdd
                      onClick={() => this.toggleStateBool('showTagForm')}
                    />
                  }
                </div>
                <div className='margin-top-5'>
                  <Button
                    className='trans-cta-button info-button'
                    content='Edit'
                    onClick={() => this.toggleStateBool('editMode')}
                  />
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
});

export default connect(undefined, mapDispatchToProps)(TransItem);
