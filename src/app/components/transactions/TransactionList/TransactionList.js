import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Segment, Dimmer } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { partition } from 'ramda';

import TransactionItem from '../TransactionItem';
import TransactionEdit from '../TransactionEdit';
import { clearTransactions, fetchTransactions } from '../../../store/actions/transactions';

import './TransactionList.css';

class TransactionsPage extends React.Component {
  static propTypes = {
    allTransactionsFetched: PropTypes.bool,
    clearTransactions: PropTypes.func,
    fetchTransactions: PropTypes.func,
    isFetching: PropTypes.bool,
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
      limit: 20,
      page: 0,
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
      fetchTransactions({ limit: this.state.limit, page: this.state.page });
    });
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  atBottom = () => this.pageRef.getBoundingClientRect().bottom <= window.innerHeight + 10;

  handleScroll = () => {
    if (this.atBottom() && !this.props.allTransactionsFetched) {
      const { limit, page } = this.state;
      this.setState({ page: page + 1 });
      this.props.fetchTransactions({ limit: limit, page: page + 1 });
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
    const { isFetching, transactions } = this.props;

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
             <Segment className='transaction-fetch-loader'>
               <Dimmer active inverted>
                 <Loader inverted>Loading</Loader>
               </Dimmer>
             </Segment>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  allTransactionsFetched: state.transactions.allTransactionsFetched,
  isFetching: state.transactions.isFetching,
  transactions: state.transactions.items,
});

const mapDispatchToProps = dispatch => ({
  clearTransactions: () => { dispatch(clearTransactions()); },
  fetchTransactions: params => { dispatch(fetchTransactions(params)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionsPage);
