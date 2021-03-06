import React from 'react';
import PropTypes from 'prop-types';
import DayPicker from 'react-day-picker';
import { Button } from 'semantic-ui-react';

import 'react-day-picker/lib/style.css';

const DatePicker = ({
  onDayClick,
  onPickerClose,
  showClose,
  ...props
}) => (
  <div className='date-picker'>
    {showClose &&
      <Button
        className='close-picker red-button'
        content='X'
        onClick={onPickerClose}
        size='mini'
      />
    }
    <DayPicker onDayClick={onDayClick} {...props} />
  </div>
);

DatePicker.propTypes = {
  onDayClick: PropTypes.func,
  onPickerClose: PropTypes.func,
  showClose: PropTypes.bool,
};

DatePicker.defaultProps = {
  showClose: true,
};

export default DatePicker;
