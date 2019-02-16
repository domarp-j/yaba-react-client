import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';
import { withRouter } from 'react-router';

import { SaveIndicator } from '../../misc';
import { Tag } from '../../tags';
import routes from '../../../routes';

const NavBase = props => (
  <Menu secondary className='padding-10'>
    <Menu.Item onClick={() => props.history.push(routes.homePage)}>
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
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default withRouter(NavBase);
