import moment from 'moment';

export const dollarToFloat = dollarVal => (
  parseFloat(dollarVal.replace(/\$|,/g, ''))
);

export const floatToDollar = value => {
  const valueStr = parseFloat(value).toFixed(2);

  return valueStr[0] === '-' ?
    `-$${valueStr.slice(1)}` : `$${valueStr}`;
};


export const dateify = date => (
  moment(date).utc().format('MM/DD/YYYY')
);

