import React, { Component } from "react";
import { Tooltip, Icon, Badge, Dropdown, Menu, Button, Row, Col, Avatar, List } from "antd";

import PropTypes from "prop-types";



const propTypes = {
    count: PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.any),
    // viewMoreText: PropTypes.string,
}

const defaultProps = {
    showClear: true,
    showViewMore: true,
}

export class NoticeList extends Component {

    render() {
        const data = this.props.data;

        console.log(data);

        if (!data || data.length === 0) {
            return (
                <div className=".notification-notFound">
                    <img
                        src="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
                        alt="not found"
                    />
                    <div>You have 0 unread notifications.</div>
                </div>
            );
        }

        return (
            <div>
                <List
                    className=".notification-list"
                    dataSource={data}
                    renderItem={(item, i) => {

                        const itemCls = item.read ? 'item read' : 'item'

                        const leftIcon = item.avatar ? (
                            typeof item.avatar === 'string' ? (
                                <Avatar className="avatar" src={item.avatar} />
                            ) : (
                                    <span className="iconElement">{item.avatar}</span>
                                )
                        ) : null;

                        return (
                            <List.Item
                                className={itemCls}
                                key={item.key || i}
                                onClick={() => { }}
                            >
                                <List.Item.Meta
                                    avatar={leftIcon}
                                    title={
                                        <div className="title">
                                            {item.title}
                                            <div className="extra">{item.extra}</div>
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <div>{item.description}</div>
                                            <div>{item.datetime}</div>
                                        </div>
                                    }
                                />
                            </List.Item>
                        );
                    }} />
                <div className=".notification-bottomBar">
                    <div onClick={(e) => { }}>
                        Clear Notifications
                    </div>
                    <div onClick={(e) => { }}>
                        View More
                    </div>
                </div>
            </div>
        )
    }

};

NoticeList.propTypes = propTypes;
NoticeList.defaultProps = defaultProps;


export default NoticeList;
