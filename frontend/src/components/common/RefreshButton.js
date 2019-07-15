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
  listActions: PropTypes.arrayOf(PropTypes.func),
  requests: PropTypes.arrayOf(PropTypes.func),
};

const defaultProps = {
  actions: [],
  listActions: [],
  requests: [],
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

const RefreshButton = (props) => (
  <Button
    type="primary"
    onClick={refreshStore(
      { actions: props.actions, listActions: props.listActions },
      props.requests
    )}
    className="btn--middle"
  >
    <Icon type="sync" theme="outlined" />
  </Button>
);

RefreshButton.propTypes = propTypes;
RefreshButton.defaultProps = defaultProps;

export default RefreshButton;
