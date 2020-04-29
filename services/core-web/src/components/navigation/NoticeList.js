import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Tooltip, Icon, Badge, Dropdown, Menu, Button, Row, Col, Avatar, List } from "antd";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import MediaQuery from "react-responsive";
import { includes } from "lodash";
import { getUserInfo } from "@common/selectors/authenticationSelectors";
import { fetchMineVerifiedStatuses } from "@common/actionCreators/mineActionCreator";
import {
  getCurrentUserVerifiedMines,
  getCurrentUserUnverifiedMines,
} from "@common/reducers/mineReducer";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import * as Permission from "@/constants/permissions";
import SearchBar from "@/components/search/SearchBar";
import { LOGO, HAMBURGER, CLOSE, SUCCESS_CHECKMARK, YELLOW_HAZARD } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  count: PropTypes.number,
  name: PropTypes.string,
  showClear: PropTypes.boolean,
  //showViewMore?: PropTypes.boolean,
  //  style?: React.CSSProperties,
  title: PropTypes.string,
  tabKey: PropTypes.string,
  data: PropTypes.Array,
  onClick: PropTypes.func,
  onClear: PropTypes.func,
  emptyText: PropTypes.string,
  clearText: PropTypes.string,
  viewMoreText: PropTypes.string,
  list: PropTypes.Array,
  onViewMore: PropTypes.func,
};

const defaultProps = {};

export class NoticeList extends Component {
  render() {
    if (!data || data.length === 0) {
      return (
        <div className={styles.notFound}>
          <img
            src="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
            alt="not found"
          />
          <div>{emptyText}</div>
        </div>
      );
    }
    return <div></div>;
  }
}

export default NoticeList;
