import moment from 'moment';

export const dateify = date => (
  moment(date).utc().format('MM/DD/YYYY')
);

