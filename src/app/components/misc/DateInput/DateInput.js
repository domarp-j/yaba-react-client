import React from 'react';
import PropTypes from 'prop-types';
import Cleave from 'cleave.js/react';
import { Form } from 'semantic-ui-react';

import DatePicker from '../DatePicker';

/*
  DatePicker uses a library that passes in a Date object as an argument
  to the onDayClick event handler.
  This function converts that date object into MM/DD/YYYY format,
  since that is the most common format used throughout the app.
  The MDY date is passed into the date click event handler passed in as
  a prop by the user of this component.
*/
const handleDateInputClick = (date, onDayClick) => {
  const month = date.getMonth() + 1;
  const paddedMonth = month < 10 ? `0${month}` : month;
  const day = date.getDate();
  const paddedDay = day < 10 ? `0${day}` : day;
  const year = date.getFullYear();
  const dateMDY = `${paddedMonth}/${paddedDay}/${year}`;

  onDayClick(dateMDY);
};

const DateInput = ({
  className,
  id,
  label,
  name,
  onBlur,
  onChange,
  onDayClick,
  onFocus,
  onInit,
  onPickerClose,
  showDatePicker,
  value,
}) => (
  <Form.Field>
    {label && <label htmlFor='date'>{label}</label>}
    <div className='ui input'>
      <Cleave
        className={className}
        id={id}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onInit={onInit}
        options={{
          date: true, datePattern: ['m', 'd', 'Y'],
        }}
        value={value}
      />
    </div>
    {showDatePicker &&
      <DatePicker
        onDayClick={day => handleDateInputClick(day, onDayClick)}
        onPickerClose={onPickerClose}
      />
    }
  </Form.Field>
);

DateInput.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onDayClick: PropTypes.func,
  onFocus: PropTypes.func,
  onInit: PropTypes.func,
  onPickerClose: PropTypes.func,
  showDatePicker: PropTypes.bool,
  value: PropTypes.string,
};

export default DateInput;
