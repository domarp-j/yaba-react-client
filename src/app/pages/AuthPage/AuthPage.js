import React from 'react';
import PropTypes from 'prop-types';
import { Container, Segment } from 'semantic-ui-react';

import NavSignedOut from '../../components/navigation/NavSignedOut';
import SignInForm from '../../components/auth/SignInForm';
import SignUpForm from '../../components/auth/SignUpForm';
import routes from '../../routes';

const signIn = 'signIn';
const signUp = 'signUp';

const authConfig = {
  [signIn]: {
    headerText: 'Sign in',
    oppositeActionText: 'Sign up',
    oppositeActionUrl: routes.signUpPage,
    form: SignInForm,
  },
  [signUp]: {
    headerText: 'Sign up',
    oppositeActionText: 'Sign in',
    oppositeActionUrl: routes.signInPage,
    form: SignUpForm,
  },
};

const AuthPage = ({ authType }) =>  {
  const AuthForm = authConfig[authType].form;

  return (
    <div>
      <NavSignedOut
        actionText={authConfig[authType].oppositeActionText}
        actionUrl={authConfig[authType].oppositeActionUrl}
      />
      <Container text textAlign='left'>
        <Segment>
          <h1>{authConfig[authType].headerText}</h1>
          <AuthForm />
        </Segment>
      </Container>
    </div>
  );
};

AuthPage.propTypes = {
  authType: PropTypes.oneOf([signIn, signUp]),
};

export default AuthPage;
