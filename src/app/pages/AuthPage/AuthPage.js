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
    oppositeActionText: 'Sign up',
    oppositeActionUrl: routes.signUpPage,
    form: SignInForm,
  },
  [signUp]: {
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
        <h1 className='header-catch-phrase'>
          Simplify Your Budget.
        </h1>
        <div className='what-is-yaba'>
          Yaba is Yet Another Budget App. Tag your transactions and gain perspective on your spending habits.
        </div>
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
