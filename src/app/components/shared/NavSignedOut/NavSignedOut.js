import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';
import { withRouter } from 'react-router';

const handleAction = (actionUrl, history) => {
  history.push(actionUrl);
};

const NavSignedOut = ({
  actionText,
  actionUrl,
  history,
}) => {
  return (
    <Menu secondary>
      <Menu.Item name='yaba' />
      <Menu.Menu position='right'>
        <Menu.Item name={actionText} onClick={() => { handleAction(actionUrl, history); }}></Menu.Item>
      </Menu.Menu>
    </Menu>
  );
};

NavSignedOut.propTypes = {
  actionText: PropTypes.string.isRequired,
  actionUrl: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(NavSignedOut);
