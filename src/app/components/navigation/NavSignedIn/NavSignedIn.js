import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';
import { withRouter } from 'react-router';
import { compose } from 'ramda';

import routes from '../../../routes';
import { persistor } from '../../../store/store';
// TODO: Get redux-token-auth signOutUser to work? Honestly, it's not super reliable.

class NavSignedIn extends React.Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func,
    }),
  }

  signOut = e => {
    const { history } = this.props;

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
    })
      .then(() => history.push(routes.signInPage));

  };

  render() {
    return (
      <Menu secondary>
        <Menu.Item name='yaba' />
        <Menu.Menu position='right'>
          <Menu.Item name='Sign out' onClick={this.signOut}></Menu.Item>
        </Menu.Menu>
      </Menu>
    );
  }
}

export default compose(withRouter)(NavSignedIn);
