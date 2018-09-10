import React from 'react';
import PropTypes from 'prop-types';
import { Button, Header, Icon, Segment } from 'semantic-ui-react';

import './TransactionListData.css';

const TransactionListData = ({
  count,
  onManageClick,
  totalAmount,
}) => (
  <Segment className='no-margin'>
    <Header
      as='h1'
      className='no-margin'
      icon
      textAlign='center'
    >
      <Icon name='dollar' circular />
      <Header.Content id='total-amount'>{totalAmount}</Header.Content>
    </Header>

    <Header
      as='h3'
      textAlign='center'
      className='margin-top-15'
    >
      Total for {count} transactions
    </Header>

    <div className='center-horizontally margin-top-bottom-15'>
      <Button color='blue' size='large' onClick={onManageClick}>Manage transactions</Button>
    </div>
  </Segment>
);

TransactionListData.propTypes = {
  count: PropTypes.number,
  onManageClick: PropTypes.func,
  totalAmount: PropTypes.string,
};

export default TransactionListData;
