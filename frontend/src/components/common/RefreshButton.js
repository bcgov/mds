import React from "react";
import PropTypes from "prop-types";
import { Icon, Button } from "antd";
import { store } from "@/App";

/**
 * @constant RefreshButton  - Pre-styled button that accepts actions and
 * requests to refresh the Redux store with the latest data.
 */

const propTypes = {
  actions: PropTypes.arrayOf(PropTypes.func),
  requests: PropTypes.arrayOf(PropTypes.func),
  // This can legitimately be anything
  // eslint-disable-next-line react/forbid-prop-types
  initialValue: PropTypes.any,
};

const defaultProps = {
  actions: [],
  requests: [],
  initialValue: { records: [] },
};

const refreshStore = (actions, requests, initialValue) => () => {
  actions.forEach((action) => {
    store.dispatch(action(initialValue));
  });

  requests.forEach((request) => request());
};

const RefreshButton = (props) => (
  <Button type="primary" onClick={refreshStore(props.actions, props.requests, props.initialValue)}>
    <Icon type="sync" theme="outlined" />
  </Button>
);

RefreshButton.propTypes = propTypes;
RefreshButton.defaultProps = defaultProps;

export default RefreshButton;
