import React from 'react';
import { Container, Tab } from 'semantic-ui-react';

import NavSignedIn from '../../components/navigation/NavSignedIn';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionForm from '../../components/transactions/TransactionForm';
import TransactionFilter from '../../components/transactions/TransactionFilter';

class TransactionsPage extends React.Component {
  miniNavigation = (
    <Tab
      panes={[
        {
          menuItem: 'Filter transactions',
          render: () => (
            <Tab.Pane><TransactionFilter /></Tab.Pane>
          ),
        },
        {
          menuItem: 'Add a transaction',
          render: () => (
            <Tab.Pane><TransactionForm /></Tab.Pane>
          ),
        },
      ]}
    />
  )

  render() {
    return (
      <div>
        <NavSignedIn />
        <Container textAlign='left'>
          {this.miniNavigation}
          <TransactionList />
        </Container>
      </div>
    );
  }
}

export default TransactionsPage;
