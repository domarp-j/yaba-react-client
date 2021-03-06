import moment from 'moment';

export const regexMDY = /\d{2}\/\d{2}\/\d{4}/g;

export const currentDateMDY = () => (
  moment().format('MM/DD/YYYY')
);

export const currentDateYMD = () => (
  moment().format('YYYY-MM-DD')
);

export const dateToMDY = date => (
  date && moment(date).utc().format('MM/DD/YYYY')
);

export const dateToYMD = date => (
  date && moment(date).utc().format('YYYY-MM-DD')
);

export const friendlyDate = date => (
  date && moment(date).utc().format('MMMM D, YYYY')
);
