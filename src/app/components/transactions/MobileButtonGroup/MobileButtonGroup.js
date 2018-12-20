import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { ButtonToModal } from '../../misc';
import { CsvDownload, Filter, Sorter } from '../../transactions';
import { showTransactionForm } from '../../../store/actions/transactions';

class MobileButtonGroup extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
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

  dashboardModal = ({ component: Component, icon, id, stateKey }) => {
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

    return (
      <ButtonToModal
        button={<Button
          className={this.buttonClassName}
          circular
          icon={icon}
          onClick={openModal}
          size={this.buttonSize}
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
      id,
      showTransactionForm,
    } = this.props;

    const {
      showButtons,
    } = this.state;

    return (
      <div className={`mobile-button-group ${className}`} id={id}>
        {showButtons &&
          <div>
            <div className='action-button-wrapper'>
              <div className='action-label' id='csv-label'>Download</div>
              {this.dashboardModal({
                component: CsvDownload,
                icon: 'file alternate',
                id: 'csv-modal',
                stateKey: 'openCsvModal',
              })}
            </div>

            <div className='action-button-wrapper'>
              <div className='action-label' id='sort-label'>Sort</div>
              {this.dashboardModal({
                component: Sorter,
                icon: 'sort content ascending',
                id: 'sort-modal',
                stateKey: 'openSortModal',
              })}
            </div>

            <div className='action-button-wrapper'>
              <div className='action-label' id='filter-label'>Filter</div>
              {this.dashboardModal({
                component: Filter,
                icon: 'filter',
                id: 'filter-modal',
                stateKey: 'openFilterModal',
              })}
            </div>

            <div className='action-button-wrapper'>
              <div className='action-label' id='form-label'>Add</div>
              <Button
                className={this.buttonClassName}
                circular
                icon='plus'
                onClick={() => {
                  showTransactionForm(true);
                  window.scrollTo(0,0);
                  this.setState({ showButtons: false });
                }}
                size={this.buttonSize}
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

const mapDispatchToProps = dispatch => ({
  showTransactionForm: newState => dispatch(showTransactionForm(newState)),
});

export default connect(null, mapDispatchToProps)(MobileButtonGroup);
