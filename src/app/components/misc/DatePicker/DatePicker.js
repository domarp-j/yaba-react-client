import React from 'react';
import PropTypes from 'prop-types';
import DayPicker from 'react-day-picker';
import { Button } from 'semantic-ui-react';

import 'react-day-picker/lib/style.css';

const DatePicker = ({
  onDayClick,
  onPickerClose,
}) => (
  <div className='date-picker'>
    <Button
      className='close-picker error-button'
      content='X'
      onClick={onPickerClose}
      size='mini'
    />
    <DayPicker onDayClick={onDayClick} />
  </div>
);

DatePicker.propTypes = {
  onDayClick: PropTypes.func,
  onPickerClose: PropTypes.func,
};

export default DatePicker;
