import React from 'react';
import { Grid } from 'semantic-ui-react';

import { SignUpForm } from '../../components/auth';
import { NavSignedOut } from '../../components/navigation';
import routes from '../../routes';

const HomePage = () => (
  <div>
    <NavSignedOut actionText='Sign in' actionUrl={routes.signInPage} showTag={false} />
    <Grid className='home-page' stackable verticalAlign='middle'>
      <Grid.Row>
        <Grid.Column className='splash-info' width={10}>
          <h1 className='motto'>
            Simplify Your Budget.
          </h1>
          <div className='explanation'>
            Yaba is Yet Another Budget App. Tag your transactions and gain perspective on your spending habits.
          </div>
        </Grid.Column>
        <Grid.Column className='sign-up' width={6}>
          <SignUpForm />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
);

export default HomePage;
