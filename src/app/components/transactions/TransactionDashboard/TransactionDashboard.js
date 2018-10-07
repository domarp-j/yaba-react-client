import React from 'react';
import PropTypes from 'prop-types';
import { Button, Header, Icon, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';

import TransactionFilterText from '../TransactionFilterText';
import { clearTransactionQueries } from '../../../store/actions/transactionQueries';

import './TransactionDashboard.css';

/*
  This is a dashboard that shows important transaction data such as
    total amount & total number of transactions.

  This dashboard also includes CTAs to add & filter transactions, along
    with a segment that displays the user's currently transaction filter
    queries in a human-readable format.
*/

const anyQueryPresent = ({
  description,
  fromDate,
  tags,
  toDate,
}) => (
  description || fromDate || (tags && tags.length > 0) || toDate
);

const TransactionDashboard = ({
  addButton,
  clearQueries,
  count,
  csvButton,
  filterButton,
  queries,
  sortButton,
  totalAmount,
}) => (
  <div>
    {/* Display transaction data */}
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

      {/* Transaction CTAs */}
      <div className='center-horizontally'>
        {addButton()}
        {filterButton()}
        {sortButton()}
        {csvButton()}
        {anyQueryPresent(queries) &&
          <Button
            circular
            className='margin-5'
            color='red'
            icon='undo'
            onClick={clearQueries}
            size='huge'
          />
        }
      </div>
    </Segment>

    {/* Current filter query */}
    {anyQueryPresent(queries) &&
        <Segment id='filter-text' className='no-margin'>
          Displaying transactions <TransactionFilterText {...queries} />
        </Segment>
    }
  </div>
);

TransactionDashboard.propTypes = {
  addButton: PropTypes.func,
  clearQueries: PropTypes.func,
  count: PropTypes.number,
  csvButton: PropTypes.func,
  filterButton: PropTypes.func,
  queries: PropTypes.object,
  sortButton: PropTypes.func,
  totalAmount: PropTypes.string,
};

const mapStateToProps = state => ({
  queries: state.transactions.queries,
});

const mapDispatchToProps = dispatch => ({
  clearQueries: () => dispatch(clearTransactionQueries()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionDashboard);
