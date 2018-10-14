import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';
import { connect } from 'react-redux';

import {
  ERROR,
  INFO,
  SUCCESS,
  WARNING,
  removeAlert
} from '../../../store/actions/alerts';

const AlertList = ({ alerts, removeAlert }) => (
  <div className='alert-list'>
    {alerts.length > 0 &&
      alerts.map(alert => (
        <Message
          className='alert'
          content={alert.message}
          key={alert.id}
          onDismiss={() => removeAlert(alert.id)}
          size='large'
          // Determine alert type
          error={alert.type === ERROR}
          info={alert.type === INFO}
          success={alert.type === SUCCESS}
          warning={alert.type === WARNING}
        />
      ))
    }
  </div>
);

AlertList.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    message: PropTypes.string,
  })),
  removeAlert: PropTypes.func,
};

const mapStateToProps = state => ({
  alerts: state.alerts,
});

const mapDispatchToProps = dispatch => ({
  removeAlert: alertId => dispatch(removeAlert(alertId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AlertList);
