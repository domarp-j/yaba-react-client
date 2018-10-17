import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Segment, Dimmer } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { any, identity, keys, merge, partition } from 'ramda';

import TransItem from '../TransItem';
import TransEdit from '../TransEdit';
import {
  DEFAULT_FETCH_LIMIT,
  clearTransactions,
  fetchTransactions
} from '../../../store/actions/transactions';

class TransList extends React.PureComponent {
  static propTypes = {
    allTransactionsFetched: PropTypes.bool,
    clearTransactions: PropTypes.func,
    fetchTransactions: PropTypes.func,
    isFetching: PropTypes.bool,
    noTransactionsFound: PropTypes.bool,
    queries: PropTypes.object,
    sorting: PropTypes.object,
    transactions: PropTypes.arrayOf(PropTypes.shape({
      amount: PropTypes.string,
      date: PropTypes.string,
      description: PropTypes.string,
      id: PropTypes.number,
      tags: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        description: PropTypes.string,
      })),
    })),
  };

  constructor() {
    super();

    this.state = {
      limit: DEFAULT_FETCH_LIMIT,
      page: 0,
    };

    this.pageRef = undefined;

    this.setPageRef = ele => {
      this.pageRef = ele;
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);

    new Promise(resolve => {
      this.props.clearTransactions();
      resolve();
    }).then(() => {
      this.fetchTransRequest(this.state.limit, this.state.page);
    });
  }

  /*
    Check if a transaction query param or sort param has changed.
    If so, clear out the current transactions and fetch a fresh batch.
  */
  componentDidUpdate(prevProps) {
    if (this.queryOrSortChanged(prevProps, this.props)) {
      new Promise(resolve => {
        this.props.clearTransactions();
        resolve();
      }).then(() => {
        this.setState(() => ({
          limit: DEFAULT_FETCH_LIMIT,
          page: 0,
        }), () => {
          this.fetchTransRequest(DEFAULT_FETCH_LIMIT, 0);
        });
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  fetchTransRequest = (limit, page) => {
    this.props.fetchTransactions({
      limit,
      page,
      ...this.props.queries,
      ...this.props.sorting,
    });
  }

  // Check if a transaction query param or sort param has changed
  queryOrSortChanged = (prevProps, currProps) => (
    any(identity)(
      keys(merge(prevProps.queries, prevProps.sorting)).map(param => (
        merge(prevProps.queries, prevProps.sorting)[param] !==
          merge(currProps.queries, currProps.sorting)[param]
      ))
    )
  )

  atBottom = () => (
    this.pageRef.getBoundingClientRect().bottom <= window.innerHeight + 10
  );

  handleScroll = () => {
    if (this.atBottom() && !this.props.allTransactionsFetched) {
      const { limit, page } = this.state;
      this.setState({ page: page + 1 });
      this.fetchTransRequest(limit, page + 1);
    }
  }

  separateJustAddedTransactions = transactions => (
    partition(item => item.justAdded, transactions)
  )

  renderTransaction = transaction => (
    transaction.editMode ?
      <TransEdit
        amount={transaction.amount}
        date={transaction.date}
        description={transaction.description}
        key={transaction.id}
        tags={transaction.tags}
        transactionId={transaction.id}
      /> :
      <TransItem
        amount={transaction.amount}
        date={transaction.date}
        description={transaction.description}
        key={transaction.id}
        tags={transaction.tags}
        transactionId={transaction.id}
      />
  )

  render() {
    const {
      allTransactionsFetched,
      isFetching,
      noTransactionsFound,
      transactions,
    } = this.props;

    const partitionedTransactions = this.separateJustAddedTransactions(transactions);
    const newTransactions = partitionedTransactions[0];
    const oldTransactions = partitionedTransactions[1];

    return (
      <div ref={this.setPageRef}>
        {newTransactions.length > 0 &&
          <div className='new-transaction-section'>
            {newTransactions.map(transaction => this.renderTransaction(transaction))}
          </div>
        }

        {oldTransactions.length > 0 &&
          oldTransactions.map(transaction => this.renderTransaction(transaction))
        }

        {isFetching &&
          <Segment id='transaction-fetch-loader' className='no-margin'>
            <Dimmer active inverted>
              <Loader inverted>Loading</Loader>
            </Dimmer>
          </Segment>
        }

        {allTransactionsFetched && !noTransactionsFound &&
          <Segment
            id='end-of-list-indicator'
            color='black'
            size='huge'
          >
            End of list
          </Segment>
        }

        {noTransactionsFound &&
          <Segment
            id='end-of-list-indicator'
            color='black'
            size='huge'
          >
            No transactions found
          </Segment>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  allTransactionsFetched: state.transactions.events.allTransactionsFetched,
  isFetching: state.transactions.events.isFetching,
  noTransactionsFound: state.transactions.events.noTransactionsFound,
  queries: state.transactions.queries,
  sorting: state.transactions.sorting,
  transactions: state.transactions.items,
});

const mapDispatchToProps = dispatch => ({
  clearTransactions: () => { dispatch(clearTransactions()); },
  fetchTransactions: params => { dispatch(fetchTransactions(params)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(TransList);