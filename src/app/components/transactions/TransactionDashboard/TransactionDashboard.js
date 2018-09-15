import React from 'react';
import PropTypes from 'prop-types';
import { Header, Icon, Segment } from 'semantic-ui-react';

import './TransactionDashboard.css';

const TransactionDashboard = ({
  addButton,
  count,
  filterButton,
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

    <div className='center-horizontally'>
      {addButton()}
      {filterButton()}
    </div>
  </Segment>
);

TransactionDashboard.propTypes = {
  addButton: PropTypes.func,
  count: PropTypes.number,
  filterButton: PropTypes.func,
  totalAmount: PropTypes.string,
};

export default TransactionDashboard;
