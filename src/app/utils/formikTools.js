import { isEmpty } from 'ramda';

export const errorsList = errors => {
  return Object.entries(errors).map(errorsArray => {
    return errorsArray[1];
  });
};

export const allFieldsTouched = (touched, fields) => {
  const touchedValues = fields.map(field => {
    return touched[field];
  });

  return !(touchedValues.includes(false) || touchedValues.includes(undefined));
};

export const anyErrorsPresent = errors => {
  return !isEmpty(errors);
};

export const touchAllFields = fields => (
  fields.reduce((accum, field) => {
    accum[field] = true;
    return accum;
  }, {})
);
