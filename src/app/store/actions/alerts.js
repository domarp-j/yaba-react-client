// Alert types

export const ERROR = 'error';
export const INFO = 'info';
export const SUCCESS = 'success';
export const WARNING = 'warning';

// Add an alert

export const ADD_ALERT = 'ADD_ALERT';
export const addAlert = alert => ({
  type: ADD_ALERT,
  alertType: alert.type,
  alertMessage: alert.message,
});

// Remove an alert

export const REMOVE_ALERT = 'REMOVE_ALERT';
export const removeAlert = alertId => ({
  type: REMOVE_ALERT,
  alertId,
});

// Alert helpers that can be used for external calls

export const serverErrorCheck = (err, dispatch,) => {
  if (err.response.status === 500) {
    dispatch(addAlert({
      type: ERROR,
      message: 'We ran into an error on our side. Please try again in a few minutes.',
    }));
  }
};
