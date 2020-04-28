import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Tooltip, Icon, Badge, Dropdown, Menu, Button, Row, Col } from "antd";
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
import NoticeList from "@/components/navigation/NoticeList"
const { TabPane } = Tabs;

const propTypes = {
    count: PropTypes.number,
    // bell?: React.ReactNode;
    // className?: string,
    loading: PropTypes.boolean,
    // onClear?: PropTypes.func,
    // onItemClick?: (item: NoticeIconData, tabProps: NoticeIconTabProps) => void;
    // onViewMore?: (tabProps: NoticeIconTabProps, e: MouseEvent) => void;
    // onTabChange?: (tabTile: string) => void;
    // style?: React.CSSProperties;
    // onPopupVisibleChange?: (visible: boolean) => void;
    popupVisible: PropTypesboolean,
    clearText: PropTypes.string,
    viewMoreText: PropTypes.string,
    clearClose: PropTypes.boolean,
    emptyImage: PropTypes.string,
    children: PropTypes.Array,

    userInfo: PropTypes.shape({ preferred_username: PropTypes.string.isRequired }).isRequired,
    activeButton: PropTypes.string.isRequired,
    fetchNotifications: PropTypes.func.isRequired,
    currentNotifications: PropTypes.arrayOf(PropTypes.string)
};

const defaultProps = {
    currentNotifications: ['Test', 'Notifications'],
    emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg',
};

export class NoticeBox extends Component {

    render() {
        const { className, count, bell, loading } = this.props;

        if (loading) return this.notificationsBox

        return (
            <Tabs className={styles.tabs} onChange={onTabChange}>

                <TabPane tab={tabTitle} key={tabKey}>
                    <NoticeList
                        clearText={clearText}
                        viewMoreText={viewMoreText}
                        data={list}
                        onClear={() => onClear && onClear(title, tabKey)}
                        onClick={() => onItemClick && onItemClick(item, child.props)}
                        onViewMore={() => onViewMore && onViewMore(child.props, event)}
                        showClear={showClear}
                        showViewMore={showViewMore}
                        title={title}
                        {...child.props}
                    />
                </TabPane>
            </Tabs>

        )
    }
}


NoticeIcon.Tab = NoticeList;


export default NoticeIcon;
