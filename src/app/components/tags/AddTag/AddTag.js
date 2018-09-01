import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';

const AddTag = ({
  onClick,
}) => (
  <Button className='grouped-button' onClick={onClick}>
    <Button.Content className='no-padding'>
      <Icon name='plus' className='no-margin' />
    </Button.Content>
  </Button>
);

AddTag.propTypes = {
  onClick: PropTypes.func,
};

export default AddTag;
