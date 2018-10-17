import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const RedirectRoute = ({ redirectTo, ...rest }) => (
  <Route {...rest} render={(props) => (
    <Redirect to={{
      pathname: redirectTo,
      state: {
        from: props.location,
      },
    }} />
  )} />
);

export default RedirectRoute;
