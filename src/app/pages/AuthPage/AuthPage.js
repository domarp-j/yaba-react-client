import React from 'react';
import PropTypes from 'prop-types';
import { Container, Segment } from 'semantic-ui-react';

import { NavSignedOut } from '../../components/navigation';
import { SignInForm, SignUpForm } from '../../components/auth';
import routes from '../../routes';

const signIn = 'signIn';
const signUp = 'signUp';

const authConfig = {
  [signIn]: {
    oppositeActionText: 'Sign up',
    oppositeActionUrl: routes.signUpPage,
    form: SignInForm,
    header: 'Log in to yaba',
  },
  [signUp]: {
    oppositeActionText: 'Sign in',
    oppositeActionUrl: routes.signInPage,
    form: SignUpForm,
    header: 'Register for yaba',
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
        <h1 className='auth-header'>{authConfig[authType].header}</h1>
        <div className='auth-form-wrapper margin-top-30'>
          <Segment className='auth-form-segment'>
            <AuthForm />
          </Segment>
        </div>
      </Container>
    </div>
  );
};

AuthPage.propTypes = {
  authType: PropTypes.oneOf([signIn, signUp]),
};

export default AuthPage;
