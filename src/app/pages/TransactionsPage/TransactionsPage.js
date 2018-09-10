import React from 'react';
import PropTypes from 'prop-types';
import { Container, Tab } from 'semantic-ui-react';
import { connect } from 'react-redux';

import NavSignedIn from '../../components/navigation/NavSignedIn';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionListData from '../../components/transactions/TransactionListData';
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
      showManageView: true,
    };
  }

  toggleManageView = () => {
    this.setState(prevState => ({
      showManageView: !prevState.showManageView,
    }));
  }

  miniNavigation = (
    <Tab
      panes={[
        {
          menuItem: 'Add a transaction',
          render: () => (
            <Tab.Pane><TransactionForm /></Tab.Pane>
          ),
        },
        {
          menuItem: 'Filter transactions',
          render: () => (
            <Tab.Pane><TransactionFilter /></Tab.Pane>
          ),
        },
      ]}
    />
  )

  render() {
    const { count, totalAmount } = this.props;
    const { showManageView } = this.state;

    return (
      <div>
        <NavSignedIn />
        <Container textAlign='left'>
          <TransactionListData
            count={count}
            onManageClick={this.toggleManageView}
            totalAmount={totalAmount}
          />
          {!showManageView && this.miniNavigation}
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
