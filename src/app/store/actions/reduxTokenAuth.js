import { generateAuthActions } from 'redux-token-auth';
import routes from '../../routes';

// Config for redux-token-auth
const config = {
  authUrl: routes.signUp,
  userAttributes: {
    username: 'username',
  },
  userRegistrationAttributes: {
    username: 'username',
  },
};

// Generate thunk actions via redux-token-auth
const {
  registerUser,
  signInUser,
  signOutUser,
  verifyCredentials,
} = generateAuthActions(config);

export { registerUser, signInUser, signOutUser, verifyCredentials };
