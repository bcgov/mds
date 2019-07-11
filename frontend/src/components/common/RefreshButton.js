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
};

const defaultProps = {
  actions: [],
  requests: [],
};

const refreshStore = (actions, requests) => () => {
  actions.forEach((action) => {
    // TODO: Provide envelope in a better way
    store.dispatch(action({ records: [] }));
  });

  requests.forEach((request) => request());
};

const RefreshButton = (props) => (
  <Button type="primary" onClick={refreshStore(props.actions, props.requests)}>
    <Icon type="sync" theme="outlined" />
  </Button>
);

RefreshButton.propTypes = propTypes;
RefreshButton.defaultProps = defaultProps;

export default RefreshButton;
