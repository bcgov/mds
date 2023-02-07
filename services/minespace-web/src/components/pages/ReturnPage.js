import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import queryString from "query-string";
import { getRedirect, isAuthenticated } from "@/selectors/authenticationSelectors";
import { unAuthenticateUser } from "@/actionCreators/authenticationActionCreator";
import { signOutFromSSO } from "@/utils/authenticationHelpers";
import { RETURN_PAGE_TYPE } from "@/constants/strings";
import Loading from "@/components/common/Loading";
import * as route from "@/constants/routes";

const propTypes = {
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  unAuthenticateUser: PropTypes.func.isRequired,
  redirect: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

/**
 * @component ReturnPage - handles all re-routing while following the standard login/logout paths by clicking buttons on the UI
 * CORE/IDIR users bypass this page and authenticate through the AuthenticationGuard.js without any user input
 */

export const ReturnPage = (props) => {
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const { type } = queryString.parse(props.location.search);

    if (type === RETURN_PAGE_TYPE.SITEMINDER_LOGOUT) {
      // just returned from SiteMinder, sign out from SSO this time
      signOutFromSSO();
    } else if (type === RETURN_PAGE_TYPE.LOGOUT) {
      // finished logging out from SSO, clear redux & token and redirect home
      props.unAuthenticateUser();
    }
  }, []);

  useEffect(() => {
    const { type } = queryString.parse(props.location.search);

    // if a user manually navigates to this route, (thus type would not exist), they will be redirected home
    if (!type || type === RETURN_PAGE_TYPE.LOGOUT) {
      setRedirect(route.HOME.route);
    }

    if (props.isAuthenticated && (!props.redirect || !redirect)) {
      setRedirect(route.MINES.route);
    }
  }, [props.isAuthenticated]);

  if (redirect) {
    return <Redirect push to={redirect} />;
  }
  // props.redirect gets set after a user login and logouts.
  if (props.redirect) {
    return <Redirect push to={props.redirect} />;
  }
  return <Loading />;
};

const mapStateToProps = (state) => ({
  redirect: getRedirect(state),
  isAuthenticated: isAuthenticated(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      unAuthenticateUser,
    },
    dispatch
  );

ReturnPage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ReturnPage);
