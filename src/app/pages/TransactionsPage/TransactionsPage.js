import React from 'react';
import { Container, Tab } from 'semantic-ui-react';

import NavSignedIn from '../../components/navigation/NavSignedIn';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionForm from '../../components/transactions/TransactionForm';

class TransactionsPage extends React.Component {
  miniNavigation = (
    <Tab
      panes={[
        {
          menuItem: 'Statistics',
          render: () => (
            <Tab.Pane><div><h2>Statistics</h2></div></Tab.Pane>
          ),
        },
        {
          menuItem: 'Add a transaction',
          render: () => (
            <Tab.Pane className=''><TransactionForm /></Tab.Pane>
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
