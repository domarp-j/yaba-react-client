import React from 'react';
import PropTypes from 'prop-types';
import Cleave from 'cleave.js/react';
import { Form } from 'semantic-ui-react';

const DateInput = ({
  className,
  id,
  label,
  name,
  onBlur,
  onChange,
  onFocus,
  onInit,
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
  </Form.Field>
);

DateInput.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onInit: PropTypes.func,
  value: PropTypes.string,
};

export default DateInput;
