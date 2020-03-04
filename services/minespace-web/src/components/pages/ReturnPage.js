import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import queryString from "query-string";
import { getRedirect } from "@/selectors/authenticationSelectors";
import { authenticateUser, unAuthenticateUser } from "@/actionCreators/authenticationActionCreator";
import { signOutFromSSO } from "@/utils/authenticationHelpers";
import { RETURN_PAGE_TYPE } from "@/constants/strings";
import Loading from "@/components/common/Loading";
import * as route from "@/constants/routes";

/**
 * @class ReturnPage - handles all re-routing back and forth from Keycloak/SSO while following the standard login/logout paths by clicking buttons on the UI
 * CORE/IDIR users bypass this page and authenticate through the AuthenticationGuard.js without any user input
 */

export class ReturnPage extends Component {
  state = { redirect: null };

  static propTypes = {
    location: PropTypes.shape({ search: PropTypes.string }).isRequired,
    unAuthenticateUser: PropTypes.func.isRequired,
    authenticateUser: PropTypes.func.isRequired,
    redirect: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  };

  componentDidMount() {
    const { type, code } = queryString.parse(this.props.location.search);
    if (code) {
      // exchange code for token, store user info in redux, redirect to Dashboard
      this.props.authenticateUser(code);
    }

    if (type === RETURN_PAGE_TYPE.SITEMINDER_LOGOUT) {
      // just returned from SiteMinder, sign out from SSO this time
      signOutFromSSO();
    } else if (type === RETURN_PAGE_TYPE.LOGOUT) {
      // finished logging out from SSO, clear redux & token and redirect home
      this.props.unAuthenticateUser();
    }

    // if a user manually navigates to this route, (thus type would not exist), they will be redirected home
    if (!type) {
      this.setState({ redirect: route.HOME.route });
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }
    // props.redirect gets set after a user login and logouts.
    if (this.props.redirect) {
      return <Redirect push to={this.props.redirect} />;
    }
    return <Loading />;
  }
}

const mapStateToProps = (state) => ({
  redirect: getRedirect(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      authenticateUser,
      unAuthenticateUser,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ReturnPage);
