import React from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';

import NavSignedIn from '../../components/navigation/NavSignedIn';
import CsvDownload from '../../components/transactions/CsvDownload';
import Dashboard from '../../components/transactions/Dashboard';
import Filter from '../../components/transactions/Filter';
import TransForm from '../../components/transactions/TransForm';
import TransList from '../../components/transactions/TransList';
import Sorter from '../../components/transactions/Sorter';

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
          className='margin-5 console-button'
          onClick={() => this.toggleStateBool(stateKey)}
          size='large'
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
        <Container textAlign='left' id='transactions-page'>
          <Dashboard
            addButton={() => this.manageTransactionModal({
              buttonIcon: 'plus',
              stateKey: 'openAddModal',
              TransactionComponent: TransForm,
            })}
            count={count}
            csvButton={() => this.manageTransactionModal({
              buttonIcon: 'file',
              size: 'tiny',
              stateKey: 'openCsvModal',
              TransactionComponent: CsvDownload,
            })}
            filterButton={() => this.manageTransactionModal({
              buttonIcon: 'filter',
              size: 'tiny',
              stateKey: 'openFilterModal',
              TransactionComponent: Filter,
            })}
            sortButton={() => this.manageTransactionModal({
              buttonIcon: 'sort',
              size: 'tiny',
              stateKey: 'openSortModal',
              TransactionComponent: Sorter,
            })}
            totalAmount={totalAmount}
          />
          <TransList />
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
