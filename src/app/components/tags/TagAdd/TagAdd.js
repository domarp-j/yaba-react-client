import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';

const TagAdd = ({
  onClick,
}) => (
  <Button className='grouped-button' onClick={onClick}>
    <Button.Content className='no-padding'>
      <Icon name='plus' className='no-margin' />
    </Button.Content>
  </Button>
);

TagAdd.propTypes = {
  onClick: PropTypes.func,
};

export default TagAdd;
