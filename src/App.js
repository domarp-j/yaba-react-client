import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import routes from './app/routes';
import { Alerts } from './app/components/misc';
import { AuthPage, HomePage, TransactionsPage } from './app/pages';

const App = () => {
  return (
    <div>
      <Alerts />
      <BrowserRouter>
        <Switch>
          <Route exact path={routes.homePage} component={HomePage} />
          <Route path={routes.transactionsPage} component={TransactionsPage} />
          <Route path={routes.signUpPage} render={() => <AuthPage authType='signUp' />} />
          <Route path={routes.signInPage} render={() => <AuthPage authType='signIn' />} />
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
