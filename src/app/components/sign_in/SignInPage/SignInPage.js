import React from 'react';
import { Container, Segment } from 'semantic-ui-react';

import NavSignedOut from '../../shared/NavSignedOut';
import SignInForm from '../SignInForm';
import routes from '../../../routes';

const SignInPage = () =>  (
  <div>
    <NavSignedOut actionText='Sign up' actionUrl={routes.signUpPage} />
    <Container text textAlign='left'>
      <Segment>
        <h1>Sign in</h1>
        <SignInForm />
      </Segment>
    </Container>
  </div>
);

export default SignInPage;
