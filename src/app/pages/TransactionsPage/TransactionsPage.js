import React from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';

import NavSignedIn from '../../components/navigation/NavSignedIn';
import TransactionCsv from '../../components/transactions/TransactionCsv';
import TransactionDashboard from '../../components/transactions/TransactionDashboard';
import TransactionFilter from '../../components/transactions/TransactionFilter';
import TransactionForm from '../../components/transactions/TransactionForm';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionSort from '../../components/transactions/TransactionSort';

class TransactionsPage extends React.Component {
  static propTypes = {
    count: PropTypes.number,
    totalAmount: PropTypes.string,
  }

  constructor() {
    super();
    this.state = {
      openAddModal: false,
      openCsvModal: false,
      openFilterModal: false,
      openSortModal: false,
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
    size,
    stateKey,
    TransactionComponent,
  }) => (
    <Modal
      className='yaba-modal'
      open={this.state[stateKey]}
      size={size}
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
              buttonColor: 'green',
              buttonIcon: 'plus',
              stateKey: 'openAddModal',
              TransactionComponent: TransactionForm,
            })}
            count={count}
            csvButton={() => this.manageTransactionModal({
              buttonColor: 'purple',
              buttonIcon: 'file',
              size: 'tiny',
              stateKey: 'openCsvModal',
              TransactionComponent: TransactionCsv,
            })}
            filterButton={() => this.manageTransactionModal({
              buttonColor: 'blue',
              buttonIcon: 'filter',
              size: 'tiny',
              stateKey: 'openFilterModal',
              TransactionComponent: TransactionFilter,
            })}
            sortButton={() => this.manageTransactionModal({
              buttonColor: 'yellow',
              buttonIcon: 'sort',
              size: 'tiny',
              stateKey: 'openSortModal',
              TransactionComponent: TransactionSort,
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
