import React, { Component } from "react";

import { Tabs } from "antd";

import PropTypes from "prop-types";

import NoticeList from "@/components/navigation/NoticeList";
const { TabPane } = Tabs;

const propTypes = {
  count: PropTypes.number,
  list: PropTypes.arrayOf(PropTypes.any),
};

const defaultProps = {
  list: [],
  count: 0,
};

export class NoticeBox extends Component {
  render() {
    const list = this.props.list;
    const { loading, title } = this.props;
    console.log(list);

    if (loading) return this.notificationsBox;

    return (
      <Tabs className="notification-tabs">
        <TabPane tab="Notifications" key="1">
          <NoticeList data={list} />
        </TabPane>
      </Tabs>
    );
  }
}

NoticeBox.propTypes = propTypes;
NoticeBox.defaultProps = defaultProps;

export default NoticeBox;
