import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

import { ButtonToModal } from '../../misc';
import { CsvDownload, Filter, Sorter, TransForm } from '../../transactions';

class MobileButtonGroup extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
  }

  constructor() {
    super();
    this.state = {
      openCsvModal: false,
      openFilterModal: false,
      openSortModal: false,
      openTransactionFormModal: false,
      showButtons: false,
    };
  }

  toggleStateBool = stateKey => {
    this.setState(prevState => ({
      [stateKey]: !prevState[stateKey],
    }));
  }

  dashboardModal = ({ component: Component, icon, id, stateKey }) => (
    <ButtonToModal
      button={<Button
        className='green-button action-button'
        circular
        icon={icon}
        onClick={() => this.toggleStateBool(stateKey)}
        size='medium'
      />}
      id={id}
      showModal={this.state[stateKey]}
    >
      <Component
        onCancel={() => this.toggleStateBool(stateKey)}
        onSave={() => this.toggleStateBool(stateKey)}
      />
    </ButtonToModal>
  )

  render() {
    const {
      className,
      id,
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
                icon: 'file',
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
              {this.dashboardModal({
                component: TransForm,
                icon: 'plus',
                id: 'trans-form-modal',
                stateKey: 'openTransactionFormModal',
              })}
            </div>
          </div>
        }

        <Button
          className='green-button toggle-button'
          circular
          icon={showButtons ? 'cancel' : 'circle'}
          onClick={() => this.toggleStateBool('showButtons')}
          size='big'
        />
      </div>
    );
  }
}


export default MobileButtonGroup;
