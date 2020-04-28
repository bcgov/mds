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
    showViewMore?: PropTypes.boolean,
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
    onViewMore: PropTypes.func
}

const defaultProps = {

}

export class NoticeIcon extends Component {

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
        return (
            <div>
                <List<NoticeIconData>
                    className={styles.list}
                    dataSource={data}
                    renderItem={(item, i) => {
                        const itemCls = classNames(styles.item, {
                            [styles.read]: item.read,
                        });
                        // eslint-disable-next-line no-nested-ternary
                        const leftIcon = item.avatar ? (
                            typeof item.avatar === 'string' ? (
                                <Avatar className={styles.avatar} src={item.avatar} />
                            ) : (
                                    <span className={styles.iconElement}>{item.avatar}</span>
                                )
                        ) : null;

                        return (
                            <List.Item
                                className={itemCls}
                                key={item.key || i}
                                onClick={() => onClick && onClick(item)}
                            >
                                <List.Item.Meta
                                    className={styles.meta}
                                    avatar={leftIcon}
                                    title={
                                        <div className={styles.title}>
                                            {item.title}
                                            <div className={styles.extra}>{item.extra}</div>
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <div className={styles.description}>{item.description}</div>
                                            <div className={styles.datetime}>{item.datetime}</div>
                                        </div>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
                <div className={styles.bottomBar}>
                    {showClear ? (
                        <div onClick={onClear}>
                            {clearText} {title}
                        </div>
                    ) : null}
                    {showViewMore ? (
                        <div
                            onClick={(e) => {
                                if (onViewMore) {
                                    onViewMore(e);
                                }
                            }}
                        >
                            {viewMoreText}
                        </div>
                    ) : null}
                </div>
            </div>
        )
    }


};

export default NoticeList;
