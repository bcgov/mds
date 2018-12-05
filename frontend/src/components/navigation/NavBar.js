import React, { Component } from "react";
import { Icon, Dropdown } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { getUserInfo } from "@/selectors/authenticationSelectors";
import * as router from "@/constants/routes";
import * as String from "@/constants/strings";
import { HOME, PROFILE } from "@/constants/assets";
import Logout from "../authentication/Logout";

/**
 * @class NavBar - Simple fixed navbar at the top of the screen with home button/username/logout
 */

const propTypes = {
  userInfo: PropTypes.object,
};

const defaultProps = {
  userInfo: {},
};

export class NavBar extends Component {
  render() {
    return (
      <div className="menu">
        <Link to={router.MINE_DASHBOARD.dynamicRoute(String.DEFAULT_PAGE, String.DEFAULT_PER_PAGE)}>
          <img className="menu__img" src={HOME} />
        </Link>
        <Dropdown overlay={<Logout />}>
          <a className="menu__dropdown-link" href="#">
            <img className="menu__img" src={PROFILE} />
            {this.props.userInfo.preferred_username}
            <Icon type="down" />
          </a>
        </Dropdown>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
    userInfo: getUserInfo(state),
  });

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  null
)(NavBar);
