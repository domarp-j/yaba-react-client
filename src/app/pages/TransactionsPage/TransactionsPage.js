import React from 'react';
import { Container } from 'semantic-ui-react';

import { SaveIndicator } from '../../components/misc';
import { NavSignedIn } from '../../components/navigation';
import { Dashboard, MobileButtonGroup, TransList } from '../../components/transactions';

const TransactionsPage = () => (
  <div>
    <NavSignedIn />
    <MobileButtonGroup className='tablet-and-mobile-only' id='trans-mobile-buttons' />
    <SaveIndicator
      className='tablet-and-mobile-only'
      id='save-indicator-mobile'
      size='huge'
    />
    <Container textAlign='left' id='transactions-page'>
      <Dashboard />
      <TransList />
    </Container>
  </div>
);

export default TransactionsPage;
