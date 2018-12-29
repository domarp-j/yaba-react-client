import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { ButtonToModal } from '../../misc';
import { CsvDownload, Filter, Sorter } from '../../transactions';
import { clearTransactionQueries } from '../../../store/actions/queries';
import { showTransactionForm } from '../../../store/actions/transactions';

class MobileButtonGroup extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    clearQueries: PropTypes.func,
    id: PropTypes.string,
    queryPresent: PropTypes.bool,
    showTransactionForm: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      openCsvModal: false,
      openFilterModal: false,
      openSortModal: false,
      openTransactionFormModal: false,
      showButtons: false,
    };
  }

  buttonSize = 'medium';
  buttonClassName = 'green-button action-button';

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
  }

  ActionButton = props => (
    <Button
      className={this.buttonClassName}
      circular
      size={this.buttonSize}
      {...props}
    />
  )

  DashboardModal = ({ component: Component, icon, id, stateKey }) => {
    const openModal = () => {
      this.setState({
        [stateKey]: true,
      });
    };

    const closeModal = () => {
      this.setState({
        showButtons: false,
        [stateKey]: false,
      });
    };

    const ActionButton = this.ActionButton;

    return (
      <ButtonToModal
        button={<ActionButton
          icon={icon}
          onClick={openModal}
        />}
        id={id}
        showModal={this.state[stateKey]}
      >
        <Component
          onCancel={closeModal}
          onSave={closeModal}
        />
      </ButtonToModal>
    );
  }

  render() {
    const {
      className,
      clearQueries,
      id,
      queryPresent,
      showTransactionForm,
    } = this.props;

    const {
      showButtons,
    } = this.state;

    const ActionButton = this.ActionButton;
    const DashboardModal = this.DashboardModal;

    return (
      <div className={`mobile-button-group ${className}`} id={id}>
        {showButtons &&
          <div>
            {queryPresent &&
              <div className='action-button-wrapper'>
                <div className='action-label' id='clear-filter-label'>Clear Filter</div>
                <ActionButton
                  className='red-button action-button'
                  icon='cancel'
                  onClick={() => {
                    clearQueries();
                    this.setState({ showButtons: false });
                  }}
                />
              </div>
            }

            <div className='action-button-wrapper'>
              <div className='action-label' id='csv-label'>Download</div>
              <DashboardModal
                component={CsvDownload}
                icon='file alternate'
                id='csv-modal'
                stateKey='openCsvModal'
              />
            </div>

            <div className='action-button-wrapper'>
              <div className='action-label' id='sort-label'>Sort</div>
              <DashboardModal
                component={Sorter}
                icon='sort content ascending'
                id='sort-modal'
                stateKey='openSortModal'
              />
            </div>

            <div className='action-button-wrapper'>
              <div className='action-label' id='filter-label'>Filter</div>
              <DashboardModal
                component={Filter}
                icon='filter'
                id='filter-modal'
                stateKey='openFilterModal'
              />
            </div>

            <div className='action-button-wrapper'>
              <div className='action-label' id='form-label'>Add</div>
              <ActionButton
                icon='plus'
                onClick={() => {
                  showTransactionForm(true);
                  window.scrollTo(0,0);
                  this.setState({ showButtons: false });
                }}
              />
            </div>
          </div>
        }

        <Button
          className='green-button toggle-button'
          circular
          icon={showButtons ? 'cancel' : 'ellipsis vertical'}
          onClick={() => this.toggleStateBool('showButtons')}
          size='huge'
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  queryPresent: state.transactions.boolEvents.queryPresent,
});

const mapDispatchToProps = dispatch => ({
  clearQueries: () => dispatch(clearTransactionQueries()),
  showTransactionForm: newState => dispatch(showTransactionForm(newState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MobileButtonGroup);
