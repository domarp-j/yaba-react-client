import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { generateRequireSignInWrapper } from 'redux-token-auth';

import TransactionsPage from './app/components/transactions/TransactionsPage';
import SignUpPage from './app/components/sign_up/SignUpPage';
import SignInPage from './app/components/sign_in/SignInPage';
import routes from './app/routes';

import './App.css';

const requireSignIn = generateRequireSignInWrapper({
  redirectPathIfNotSignedIn: routes.signInPage,
});

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path={routes.homePage} component={requireSignIn(TransactionsPage)} />
        <Route path={routes.signUpPage} component={SignUpPage} />
        <Route path={routes.signInPage} component={SignInPage} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
