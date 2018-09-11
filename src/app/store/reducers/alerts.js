import { reject } from 'ramda';

import {
  ADD_ALERT,
  REMOVE_ALERT
} from '../actions/alerts';

const alerts = (
  state = [],
  action
) => {
  switch (action.type) {
  // Adding an alert
  case ADD_ALERT:
    return [
      ...state, {
        id: Math.random().toFixed(6).substr(2),
        type: action.alertType,
        message: action.alertMessage,
      },
    ];
  // Removing an alert
  case REMOVE_ALERT:
    return reject(alert => (
      alert.id === action.alertId
    ), state);
  default:
    return state;
  }
};

export default alerts;
