import React from 'react';
import PropTypes from 'prop-types';
import { Header, Icon, Segment } from 'semantic-ui-react';

import './TransactionListData.css';

const TransactionListData = ({
  count,
  totalAmount,
}) => (
  <Segment className='no-margin'>
    <Header as='h1' icon textAlign='center' className='no-margin'>
      <Icon name='dollar' circular />
      <Header.Content id='total-amount'>{totalAmount}</Header.Content>
    </Header>
    <Header as='h3' textAlign='center'>Total for {count} transactions</Header>
  </Segment>
);

TransactionListData.propTypes = {
  totalAmount: PropTypes.string,
  count: PropTypes.number,
};

export default TransactionListData;
