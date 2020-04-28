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

/**
 * @class NavBar - fixed and responsive navigation
 */

const propTypes = {
  userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
  activeButton: PropTypes.string.isRequired,
  fetchNotifications: PropTypes.func.isRequired,
  currentNotifications: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  currentUserNotifications: ["Test", "Notifications"],
};

export class Notifications extends Component {
  componentDidMount() {
    this.props.fetchNotifications(userInfo);
  }

  ifActiveButton = (route) => (includes(this.props.activeButton, route) ? "active-menu-btn" : "");

  render() {
    const { userInfo, fetchingNotices, onNoticeVisibleChange } = this.props;
    const noticeData = this.getNoticeData();
    const unreadMsg = this.getUnreadData(noticeData);
    return (
      <NoticeBox
        className={styles.action}
        count={userInfo && userInfo.unreadCount}
        loading={fetchingNotices}
        clearText="Clear Notifications"
        viewMoreText="View More"
        onClear={this.handleNoticeClear}
        onPopupVisibleChange={onNoticeVisibleChange}
        onViewMore={() => {
          /* Toastr */
        }}
        clearClose
      >
        <NoticeBox.Tab
          tabKey="notification"
          count={unreadMsg.notification}
          list={noticeData.notification}
          title="Notifications"
          emptyText="You have 0 unread notifications"
          showViewMore
        />
      </NoticeBox>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  currentNotifications: getCurrentUserNotifications(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      // TODO: implement action creator
      fetchNotifications,
    },
    dispatch
  );

Notifications.propTypes = propTypes;
Notifications.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
