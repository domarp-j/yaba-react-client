import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';

import Tag from '../../tags/Tag';

const NavBase = props => (
  <Menu secondary>
    <Menu.Item>
      <Tag content='yaba' />
    </Menu.Item>
    <Menu.Menu position='right'>
      {props.children}
    </Menu.Menu>
  </Menu>
);

NavBase.propTypes = {
  children: PropTypes.node,
};

export default NavBase;
