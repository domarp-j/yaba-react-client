import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';

import { SaveIndicator } from '../../misc';
import { Tag } from '../../tags';

const NavBase = props => (
  <Menu secondary>
    <Menu.Item>
      <Tag content='yaba' />
    </Menu.Item>
    <Menu.Menu position='right'>
      <SaveIndicator
        className='hidden-tablet-and-mobile'
      />
      {props.children}
    </Menu.Menu>
  </Menu>
);

NavBase.propTypes = {
  children: PropTypes.node,
};

export default NavBase;
