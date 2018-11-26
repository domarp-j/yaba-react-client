import React from 'react';
import PropTypes from 'prop-types';
import { Button, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { CsvDownload, Filter, FilterText, Sorter, TransForm } from '../../transactions';
import { ButtonToModal } from '../../misc';
import { clearTransactionQueries } from '../../../store/actions/queries';

/*
  This is a dashboard that shows important transaction data such as
    total amount & total number of transactions.

  This dashboard also includes buttons to add, filter, and sort transactions,
    along with a segment that displays the user's currently transaction
    filter queries in a human-readable format.
*/

class Dashboard extends React.Component {
  static propTypes = {
    addButton: PropTypes.func,
    clearQueries: PropTypes.func,
    count: PropTypes.number,
    csvButton: PropTypes.func,
    filterButton: PropTypes.func,
    queries: PropTypes.object,
    queryPresent: PropTypes.bool,
    sortButton: PropTypes.func,
    totalAmount: PropTypes.string,
  }

  constructor() {
    super();
    this.state = {
      openCsvModal: false,
      openFilterModal: false,
      openSortModal: false,
      openTransFormModal: false,
    };
  }

  buttonSize = 'small';

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
  }

  dashboardModal = ({ component: Component, icon, id, stateKey }) => (
    <ButtonToModal
      button={<Button
        className='margin-right-5 margin-top-bottom-5 no-left-margin green-button'
        onClick={() => this.toggleStateBool(stateKey)}
        icon={icon}
        size={this.buttonSize}
      />}
      showModal={this.state[stateKey]}
      id={id}
    >
      <Component
        onCancel={() => this.toggleStateBool(stateKey)}
        onSave={() => this.toggleStateBool(stateKey)}
      />
    </ButtonToModal>
  )

  render() {
    const {
      clearQueries,
      count,
      queries,
      queryPresent,
      totalAmount,
    } = this.props;

    return (
      <div>
        {/* Display transaction data */}
        <Segment id='dashboard' className={`${queryPresent ? '' : 'margin-bottom-15'}`}>
          <div className='inline-block' id='total-amount'>
            {totalAmount} <span id='transaction-count'> for {count} transactions</span>
          </div>

          {/* Transaction CTAs (Tablet Width & Larger) */}
          <div className='float-right hidden-tablet-and-mobile'>
            <div className='center-horizontally'>
              {this.dashboardModal({
                component: TransForm,
                icon: 'plus',
                id: 'trans-form-modal',
                stateKey: 'openTransFormModal',
              })}
              {this.dashboardModal({
                component: Filter,
                icon: 'filter',
                id: 'filter-modal',
                stateKey: 'openFilterModal',
              })}
              {this.dashboardModal({
                component: Sorter,
                icon: 'sort content ascending',
                id: 'sort-modal',
                stateKey: 'openSortModal',
              })}
              {this.dashboardModal({
                component: CsvDownload,
                icon: 'file',
                id: 'csv-modal',
                stateKey: 'openCsvModal',
              })}
              {queryPresent &&
                <Button
                  className='margin-right-5 margin-top-bottom-5 no-left-margin red-button'
                  icon='undo'
                  onClick={clearQueries}
                  size={this.buttonSize}
                />
              }
            </div>
          </div>
        </Segment>

        {/* Current filter query */}
        {queryPresent &&
          <Segment id='filter-text' className='margin-bottom-15'>
            <FilterText {...queries} />
          </Segment>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  count: state.transactions.count,
  queries: state.transactions.queries,
  queryPresent: state.transactions.boolEvents.queryPresent,
  totalAmount: state.transactions.totalAmount,
});

const mapDispatchToProps = dispatch => ({
  clearQueries: () => dispatch(clearTransactionQueries()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
