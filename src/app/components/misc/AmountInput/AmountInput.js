import React from 'react';
import PropTypes from 'prop-types';
import Cleave from 'cleave.js/react';
import { Button, Form } from 'semantic-ui-react';

const AmountInput = ({
  amount,
  onBlur,
  onChange,
  onSignClick,
  positiveAmount,
}) => (
  <Form.Field>
    <div className='ui left action input'>
      <Button
        className={`input-height amount-button ${positiveAmount ? 'green-button' : 'red-button'}`}
        icon={positiveAmount ? 'plus' : 'minus'}
        onClick={e => { e.preventDefault(); onSignClick({ positiveAmount: positiveAmount }); }}
      />
      <Cleave
        className='input-height input-padding'
        id='amount'
        name='amount'
        options={{
          numeral: true,
          numeralPositiveOnly: true,
          prefix: '$',
        }}
        onBlur={onBlur}
        onChange={onChange}
        value={amount || ''}
      />
    </div>
  </Form.Field>
);

AmountInput.propTypes = {
  amount: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onSignClick: PropTypes.func,
  positiveAmount: PropTypes.bool,
};

export default AmountInput;
