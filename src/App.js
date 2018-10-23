import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { generateRequireSignInWrapper } from 'redux-token-auth';

import routes from './app/routes';
import Alerts from './app/components/misc/Alerts';
import AuthPage from './app/pages/AuthPage';
import TransactionsPage from './app/pages/TransactionsPage';

const requireSignIn = generateRequireSignInWrapper({
  redirectPathIfNotSignedIn: routes.signInPage,
});

const App = () => {
  return (
    <div>
      <Alerts />

      <BrowserRouter>
        <Switch>
          <Route exact path={routes.homePage} component={requireSignIn(TransactionsPage)} />
          <Route path={routes.signUpPage} render={() => <AuthPage authType='signUp' />} />
          <Route path={routes.signInPage} render={() => <AuthPage authType='signIn' />} />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
