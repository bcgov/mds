import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Tooltip, Icon, Badge, Dropdown, Menu, Button, Row, Col } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import { includes } from "lodash";
import { getUserInfo } from "@common/selectors/authenticationSelectors";
import {
  getCurrentUserNotifications,
} from "@common/reducers/mineReducer";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import * as Permission from "@/constants/permissions";
import SearchBar from "@/components/search/SearchBar";
import { LOGO, HAMBURGER, CLOSE, SUCCESS_CHECKMARK, YELLOW_HAZARD } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

import NoticeBox from "@/components/navigation/NoticeBox"

/**
 * @class NavBar - fixed and responsive navigation
 */

const propTypes = {
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
  activeButton: PropTypes.string.isRequired,
  fetchNotifications: PropTypes.func.isRequired,
  currentNotifications: PropTypes.arrayOf(PropTypes.any),
};

const defaultProps = {
  activeButton: 'yes',
  fetchNotifications: () => { },
  currentNotifications: [
    {
      read: false,
      avatar: "https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png",
      key: 1,
      title: "CRR Submitted by 'Dummy Mine'",
      description: "Notification",
      datetime: "May 25 2020 8:30pm"
    },
    {
      read: false,
      avatar: "https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png",
      key: 2,
      title: "CRR Submitted by 'Dummy Mine'",
      description: "Notification",
      datetime: "May 22 2020 7:50am"
    },
  ]
};

export class Notifications extends Component {
  componentDidMount() {
    this.props.fetchNotifications();
  }

  ifActiveButton = (route) => (includes(this.props.activeButton, route) ? "active-menu-btn" : "");

  render() {
    const currentNotifications = this.props.currentNotifications;
    console.log(currentNotifications)

    return (
      <NoticeBox
        count={4}
        list={currentNotifications}
      >
      </NoticeBox>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  //currentNotifications: getCurrentUserNotifications(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      // TODO: implement action creator
      //fetchNotifications,
    },
    dispatch
  );

Notifications.propTypes = propTypes;
Notifications.defaultProps = defaultProps;

export default Notifications;
