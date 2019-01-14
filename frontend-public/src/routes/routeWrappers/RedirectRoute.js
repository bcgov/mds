import React from "react";
import { Route, Redirect } from "react-router-dom";

const RedirectRoute = (props) => (
  <Route
    {...props}
    render={() => (
      <Redirect
        to={{
          pathname: props.redirectTo,
          state: {
            from: props.location,
          },
        }}
      />
    )}
  />
);

export default RedirectRoute;
