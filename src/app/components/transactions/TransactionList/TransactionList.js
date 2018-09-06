import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Segment, Dimmer } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { partition } from 'ramda';

import TransactionListData from '../TransactionListData';
import TransactionItem from '../TransactionItem';
import TransactionEdit from '../TransactionEdit';
import { clearTransactions, fetchTransactions } from '../../../store/actions/transactions';

import './TransactionList.css';

class TransactionsPage extends React.PureComponent {
  INITIAL_LIMIT = 20;
  INITIAL_PAGE = 0;

  static propTypes = {
    allTransactionsFetched: PropTypes.bool,
    clearTransactions: PropTypes.func,
    fetchTransactions: PropTypes.func,
    isFetching: PropTypes.bool,
    queryTags: PropTypes.arrayOf(PropTypes.string),
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
    transactionsCount: PropTypes.number,
    transactionsTotal: PropTypes.string,
  };

  constructor() {
    super();

    this.state = {
      limit: this.INITIAL_LIMIT,
      page: this.INITIAL_PAGE,
    };

    this.pageRef = null;

    this.setPageRef = ele => {
      this.pageRef = ele;
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);

    const { clearTransactions, fetchTransactions } = this.props;

    new Promise(resolve => {
      clearTransactions();
      resolve();
    }).then(() => {
      fetchTransactions({
        limit: this.state.limit,
        page: this.state.page,
        tagNames: this.props.queryTags,
      });
    });
  }

  componentDidUpdate(prevProps) {
    const { clearTransactions, fetchTransactions, queryTags } = this.props;

    if (prevProps.queryTags !== queryTags) {
      new Promise(resolve => {
        clearTransactions();
        resolve();
      }).then(() => {
        this.setState(() => ({
          limit: this.INITIAL_LIMIT,
          page: this.INITIAL_PAGE,
        }), () => {
          fetchTransactions({
            limit: this.INITIAL_LIMIT,
            page: this.INITIAL_PAGE,
            tagNames: this.props.queryTags,
          });
        });
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  atBottom = () => this.pageRef.getBoundingClientRect().bottom <= window.innerHeight + 10;

  handleScroll = () => {
    if (this.atBottom() && !this.props.allTransactionsFetched) {
      const { limit, page } = this.state;
      this.setState({ page: page + 1 });
      this.props.fetchTransactions({
        limit: limit,
        page: page + 1,
        tagNames: this.props.queryTags,
      });
    }
  }

  separateJustAddedTransactions = transactions => (
    partition(item => item.justAdded, transactions)
  )

  renderTransaction = transaction => (
    transaction.editMode ?
      <TransactionEdit
        amount={transaction.amount}
        date={transaction.date}
        description={transaction.description}
        key={transaction.id}
        tags={transaction.tags}
        transactionId={transaction.id}
      /> :
      <TransactionItem
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
      transactions,
      transactionsCount,
      transactionsTotal,
    } = this.props;

    const partitionedTransactions = this.separateJustAddedTransactions(transactions);
    const newTransactions = partitionedTransactions[0];
    const oldTransactions = partitionedTransactions[1];

    return (
      <div ref={this.setPageRef}>
        <TransactionListData
          count={transactionsCount}
          totalAmount={transactionsTotal}
        />

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

        {allTransactionsFetched &&
          <Segment
            id='end-of-list-indicator'
            color='black'
            size='huge'
          >
            End of list
          </Segment>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  allTransactionsFetched: state.transactions.events.allTransactionsFetched,
  isFetching: state.transactions.events.isFetching,
  queryTags: state.transactions.queries.tagNames,
  transactions: state.transactions.items,
  transactionsTotal: state.transactions.totalAmount,
  transactionsCount: state.transactions.count,
});

const mapDispatchToProps = dispatch => ({
  clearTransactions: () => { dispatch(clearTransactions()); },
  fetchTransactions: params => { dispatch(fetchTransactions(params)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionsPage);
