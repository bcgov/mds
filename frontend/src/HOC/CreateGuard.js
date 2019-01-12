import React from "react";
import { connect } from "react-redux";
import hoistNonReactStatics from "hoist-non-react-statics";
import { getUserAccessData } from "@/selectors/authenticationSelectors";
import { USER_ROLES } from "@/constants/environment";

/**
 * @constant CreateGuard - Higher Order Component that checks if user has the has Write access, if so, render component, else render an empty div.
 */

export const CreateGuard = (WrappedComponent) => {
  const createGuard = (props) => {
    if (props.userRoles.includes(USER_ROLES.role_create)) {
      return <WrappedComponent {...props} />;
    }
    return <div />;
  };

  hoistNonReactStatics(createGuard, WrappedComponent);

  const mapStateToProps = (state) => ({
    userRoles: getUserAccessData(state),
  });

  return connect(
    mapStateToProps,
    null
  )(createGuard);
};

export default CreateGuard;
