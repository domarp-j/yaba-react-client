import React from 'react';
import { Container } from 'semantic-ui-react';

import { NavSignedIn } from '../../components/navigation';
import { Dashboard, MobileButtonGroup, TransList } from '../../components/transactions';

const TransactionsPage = () => (
  <div>
    <NavSignedIn />
    <MobileButtonGroup className='tablet-and-mobile-only' id='trans-mobile-buttons' />
    <Container textAlign='left' id='transactions-page'>
      <Dashboard />
      <TransList />
    </Container>
  </div>
);

export default TransactionsPage;
