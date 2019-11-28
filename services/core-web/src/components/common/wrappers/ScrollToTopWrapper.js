import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { PropTypes } from "prop-types";

/**
 * @constant ScrollToTopWrapper automatically scrolls to the top of the page on route change
 */

const propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.shape({ hash: PropTypes.string, pathname: PropTypes.string }).isRequired,
};

export class ScrollToTopWrapper extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return <div>{this.props.children}</div>;
  }
}

ScrollToTopWrapper.propTypes = propTypes;

export default withRouter(ScrollToTopWrapper);
