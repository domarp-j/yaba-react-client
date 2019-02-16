import React from 'react';
import PropTypes from 'prop-types';
import { Card, Dimmer, Loader  } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { any, equals, identity, keys, merge, partition } from 'ramda';

import routes from '../../../routes';
import { TransForm, TransItem } from '../../transactions';
import { fetchTags } from '../../../store/actions/tags';
import {
  DEFAULT_FETCH_LIMIT,
  clearTransactions,
  fetchTransactions,
  showTransactionForm
} from '../../../store/actions/transactions';

class TransList extends React.PureComponent {
  static propTypes = {
    allTransactionsFetched: PropTypes.bool,
    clearTransactions: PropTypes.func,
    displayTransactionForm: PropTypes.bool,
    fetchTags: PropTypes.func,
    fetchTransactions: PropTypes.func,
    isFetchingTransactions: PropTypes.bool,
    noTransactionsFound: PropTypes.bool,
    queries: PropTypes.object,
    showTransactionForm: PropTypes.func,
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

  constructor(props) {
    super(props);

    this.state = {
      limit: DEFAULT_FETCH_LIMIT,
      page: 0,
    };

    this.pageRef = undefined;
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);

    this.props.fetchTags();

    new Promise(resolve => {
      this.props.clearTransactions();
      resolve();
    }).then(() => {
      if (window.location.pathname === routes.transactionsPage) {
        this.fetchTransRequest(this.state.limit, this.state.page);
      }
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

  setPageRef = ele => {
    this.pageRef = ele;
  };

  // Check if a transaction query param or sort param has changed
  queryOrSortChanged = (prevProps, currProps) => (
    equals(keys(prevProps.queries).length, keys(currProps.queries).length) && any(identity)(
      keys(merge(prevProps.queries, prevProps.sorting)).map(param => (
        merge(prevProps.queries, prevProps.sorting)[param] !==
          merge(currProps.queries, currProps.sorting)[param]
      ))
    )
  )

  fetchTransRequest = (limit, page) => {
    this.props.fetchTransactions({
      limit,
      page,
      ...this.props.queries,
      ...this.props.sorting,
    });
  }

  atBottom = () => (
    this.pageRef.getBoundingClientRect().bottom <= window.innerHeight + 100
  );

  updateStateAndFetch = () => {
    const { limit, page } = this.state;
    this.setState({ page: page + 1 });
    this.fetchTransRequest(limit, page + 1);
  }

  handleScroll = () => {
    if (this.atBottom() && !this.props.allTransactionsFetched) {
      this.updateStateAndFetch();
    }
  }

  separateJustAddedTransactions = transactions => (
    partition(item => item.justAdded, transactions)
  )

  renderTransaction = transaction => (
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
      displayTransactionForm,
      isFetchingTransactions,
      noTransactionsFound,
      showTransactionForm,
      transactions,
    } = this.props;

    const partitionedTransactions = this.separateJustAddedTransactions(transactions);
    const newTransactions = partitionedTransactions[0];
    const oldTransactions = partitionedTransactions[1];

    return (
      <div ref={this.setPageRef}>
        <Card.Group centered itemsPerRow={1}>
          {displayTransactionForm &&
            <TransForm className='no-margin-bottom'
              onCancel={() => showTransactionForm(false)}
              onSave={() => showTransactionForm(false)}
            />
          }
          {newTransactions.length > 0 &&
            newTransactions.map(transaction => this.renderTransaction(transaction))
          }
          {oldTransactions.length > 0 &&
            oldTransactions.map(transaction => this.renderTransaction(transaction))
          }
          {!(isFetchingTransactions || allTransactionsFetched) &&
            <Card
              className='full-width green-button no-margin-left no-margin-right'
              id='fetch-transactions'
              onClick={this.updateStateAndFetch}
            >
              <Card.Content>
                Fetch more transactions
              </Card.Content>
            </Card>
          }
          {isFetchingTransactions &&
            <Card className='full-width' id='loader'>
              <Dimmer active inverted>
                <Loader inverted>Loading</Loader>
              </Dimmer>
            </Card>
          }
          {!isFetchingTransactions && (allTransactionsFetched || noTransactionsFound) &&
            <Card
              className='full-width no-margin-left no-margin-right'
              id='end-of-list'
            >
              <Card.Content>
                End of list
              </Card.Content>
            </Card>
          }
        </Card.Group>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  allTransactionsFetched: state.transactions.boolEvents.allTransactionsFetched,
  displayTransactionForm: state.transactions.boolEvents.displayTransactionForm,
  isFetchingTransactions: state.transactions.boolEvents.isFetchingTransactions,
  noTransactionsFound: state.transactions.boolEvents.noTransactionsFound,
  queries: state.transactions.queries,
  sorting: state.transactions.sorting,
  transactions: state.transactions.items,
});

const mapDispatchToProps = dispatch => ({
  clearTransactions: () => dispatch(clearTransactions()),
  fetchTags: () => dispatch(fetchTags()),
  fetchTransactions: params => dispatch(fetchTransactions(params)),
  showTransactionForm: newState => dispatch(showTransactionForm(newState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TransList);
