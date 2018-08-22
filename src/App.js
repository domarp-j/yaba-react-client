import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { generateRequireSignInWrapper } from 'redux-token-auth';

import routes from './app/routes';

import SignInPage from './app/pages/SignInPage';
import SignUpPage from './app/pages/SignUpPage';
import TransactionsPage from './app/pages/TransactionsPage';

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
