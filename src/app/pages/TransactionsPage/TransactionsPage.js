import React from 'react';
import { Container } from 'semantic-ui-react';
import { Sticky, StickyContainer } from 'react-sticky';

import { NavSignedIn } from '../../components/navigation';
import { Dashboard, MobileButtonGroup, TransList } from '../../components/transactions';

const dashboardTop = 25;

const stickyOffset = dashboardTop => 65 - dashboardTop;

const TransactionsPage = () => (
  <StickyContainer>
    <NavSignedIn />
    <MobileButtonGroup className='tablet-and-mobile-only' id='trans-mobile-buttons' />
    <Container textAlign='left' id='transactions-page'>
      <Sticky
        topOffset={stickyOffset(dashboardTop)}
      >
        {({ style: stickyStyles }) => (
          <div id='dashboard-wrapper' style={{ ...stickyStyles, zIndex: 1000, top: dashboardTop }}>
            <Dashboard />
          </div>
        )}
      </Sticky>
      <TransList />
    </Container>
  </StickyContainer>
);

export default TransactionsPage;
