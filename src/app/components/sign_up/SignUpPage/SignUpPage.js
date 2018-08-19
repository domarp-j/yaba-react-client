import React from 'react';
import { Container, Segment } from 'semantic-ui-react';

import NavSignedOut from '../../navigation/NavSignedOut';
import SignUpForm from '../SignUpForm';
import routes from '../../../routes';

const SignUpPage = () =>  (
  <div>
    <NavSignedOut actionText='Sign in' actionUrl={routes.signInPage} />
    <Container text textAlign='left'>
      <Segment>
        <h1>Sign up</h1>
        <SignUpForm />
      </Segment>
    </Container>
  </div>
);

export default SignUpPage;
