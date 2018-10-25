import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';
import { withRouter } from 'react-router';
import { compose } from 'ramda';

import NavBase from '../NavBase';
import routes from '../../../routes';
import { persistor } from '../../../store/store';

const signOut = (e, history) => {
  e.preventDefault();

  new Promise((resolve, reject) => {
    // Delete localStorage items used by redux-token-auth
    ['access-token', 'client', 'expiry', 'token-type', 'uid'].forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear out redux state persisted in storage
    persistor.purge()
      .then(() => resolve())
      .catch(() => reject());
  }).then(() => history.push(routes.signInPage));
};

const NavSignedIn = ({
  history,
}) => (
  <NavBase>
    <Menu.Item
      className='yaba-button margin-right-15'
      name='Sign out'
      onClick={e => signOut(e, history)}>
    </Menu.Item>
  </NavBase>
);

NavSignedIn.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default compose(withRouter)(NavSignedIn);
