import { reject } from 'ramda';

import { initialState } from '../store';

import {
  ADD_ALERT,
  REMOVE_ALERT
} from '../actions/alerts';

const alerts = (
  state = initialState.alerts,
  action
) => {
  switch (action.type) {
  case ADD_ALERT:
    return [
      ...state, {
        id: Math.random().toFixed(6).substr(2),
        type: action.alertType,
        message: action.alertMessage,
      },
    ];
  case REMOVE_ALERT:
    return reject(alert => (
      alert.id === action.alertId
    ), state);
  default:
    return state;
  }
};

export default alerts;
