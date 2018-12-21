import React from "react";
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
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
};

export const NavBar = (props) => (
  <div className="menu">
    <Link
      to={router.MINE_DASHBOARD.dynamicRoute({
        page: String.DEFAULT_PAGE,
        per_page: String.DEFAULT_PER_PAGE,
      })}
    >
      <img alt="Home" className="menu__img" src={HOME} />
    </Link>
    <Dropdown overlay={<Logout />}>
      <a className="menu__dropdown-link" href="#">
        <img alt="Profile" className="menu__img" src={PROFILE} />
        {props.userInfo.preferred_username}
        <Icon type="down" />
      </a>
    </Dropdown>
  </div>
);
const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
});

NavBar.propTypes = propTypes;

export default connect(
  mapStateToProps,
  null
)(NavBar);
