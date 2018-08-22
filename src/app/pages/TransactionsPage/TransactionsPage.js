import React from 'react';
import { Container } from 'semantic-ui-react';

import NavSignedIn from '../../components/navigation/NavSignedIn';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionForm from '../../components/transactions/TransactionForm';

class TransactionsPage extends React.Component {
  render() {
    return (
      <div>
        <NavSignedIn />
        <Container textAlign='left'>
          <TransactionForm />
          <TransactionList />
        </Container>
      </div>
    );
  }
}

export default TransactionsPage;
