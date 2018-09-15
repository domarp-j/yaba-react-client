import React from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';

import NavSignedIn from '../../components/navigation/NavSignedIn';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionDashboard from '../../components/transactions/TransactionDashboard';
import TransactionForm from '../../components/transactions/TransactionForm';
import TransactionFilter from '../../components/transactions/TransactionFilter';

class TransactionsPage extends React.Component {
  static propTypes = {
    count: PropTypes.number,
    totalAmount: PropTypes.string,
  }

  constructor() {
    super();
    this.state = {
      openAddModal: false,
      openFilterModal: false,
    };
  }

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
  }

  manageTransactionModal = ({
    buttonColor,
    buttonIcon,
    TransactionComponent,
    stateKey,
  }) => (
    <Modal
      className='yaba-modal'
      open={this.state[stateKey]}
      trigger={
        <Button
          circular
          className='margin-5'
          color={buttonColor}
          onClick={() => this.toggleStateBool(stateKey)}
          size='huge'
          icon={buttonIcon}
        />
      }
    >
      <TransactionComponent
        onCancel={() => this.toggleStateBool(stateKey)}
        onSave={() => this.toggleStateBool(stateKey)}
      />
    </Modal>
  )

  render() {
    const { count, totalAmount } = this.props;

    return (
      <div>
        <NavSignedIn />
        <Container textAlign='left'>
          <TransactionDashboard
            addButton={() => this.manageTransactionModal({
              buttonIcon: 'plus',
              buttonColor: 'green',
              stateKey: 'openAddModal',
              TransactionComponent: TransactionForm,
            })}
            count={count}
            filterButton={() => this.manageTransactionModal({
              buttonIcon: 'filter',
              buttonColor: 'blue',
              stateKey: 'openFilterModal',
              TransactionComponent: TransactionFilter,
            })}
            totalAmount={totalAmount}
          />
          <TransactionList />
        </Container>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  count: state.transactions.count,
  totalAmount: state.transactions.totalAmount,
});

export default connect(mapStateToProps)(TransactionsPage);
