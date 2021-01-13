import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { SyncOutlined } from "@ant-design/icons";
import { store } from "@/App";

/**
 * @constant RefreshButton  - Pre-styled button that accepts actions and
 * requests to refresh the Redux store with the latest data.
 */

const propTypes = {
  actions: PropTypes.arrayOf(PropTypes.func),
  listActions: PropTypes.arrayOf(PropTypes.func),
  requests: PropTypes.arrayOf(PropTypes.func),
  isNestedButton: PropTypes.bool,
};

const defaultProps = {
  actions: [],
  listActions: [],
  requests: [],
  isNestedButton: false,
};

const refreshStore = ({ actions, listActions }, requests) => () => {
  actions.forEach((action) => {
    store.dispatch(action({}));
  });

  listActions.forEach((action) => {
    store.dispatch(action({ records: [] }));
  });

  requests.forEach((request) => request());
};

const RefreshButton = (props) => {
  const triggerRefresh = refreshStore(
    { actions: props.actions, listActions: props.listActions },
    props.requests
  );

  return props.isNestedButton ? (
    <button type="button" className="full" onClick={triggerRefresh}>
      <SyncOutlined style={{ fontSize: "18px" }} className="padding-sm" />
      Refresh mine data
    </button>
  ) : (
    <Button type="primary" onClick={triggerRefresh} className="btn--middle">
      <SyncOutlined className="icon-sm" />
    </Button>
  );
};

RefreshButton.propTypes = propTypes;
RefreshButton.defaultProps = defaultProps;

export default RefreshButton;
