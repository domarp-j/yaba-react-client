import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';
import { withRouter } from 'react-router';

import NavBase from '../NavBase';

const handleAction = (actionUrl, history) => {
  history.push(actionUrl);
};

const NavSignedOut = ({
  actionText,
  actionUrl,
  history,
}) => {
  return (
    <NavBase>
      <Menu.Item
        className='yaba-button margin-right-15'
        name={actionText}
        onClick={() => {
          handleAction(actionUrl, history);
        }}>
      </Menu.Item>
    </NavBase>
  );
};

NavSignedOut.propTypes = {
  actionText: PropTypes.string.isRequired,
  actionUrl: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(NavSignedOut);
