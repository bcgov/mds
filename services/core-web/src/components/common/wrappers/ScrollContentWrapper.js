import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { includes } from "lodash";
import { PropTypes } from "prop-types";

/**
 * @constant ScrollContentWrapper renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  history: PropTypes.shape({
    location: PropTypes.shape({ state: PropTypes.shape({ activeRoute: PropTypes.string }) }),
  }).isRequired,
};

class ScrollContentWrapper extends Component {
  isActive = () => {
    const activeRoute =
      this.props.history && this.props.history.location && this.props.history.location.state
        ? this.props.history.location.state.activeRoute
        : undefined;
    const isActiveRoute = includes(activeRoute, this.props.id);
    return isActiveRoute ? "circle purple" : "circle grey";
  };

  render() {
    return (
      <div className="scroll-wrapper">
        <div className="inline-flex">
          <div className={this.isActive()} />
          <div id={this.props.id}>
            <div className="scroll-wrapper--title">
              <h3>{this.props.title}</h3>
            </div>
          </div>
        </div>
        <div className="scroll-wrapper--border">
          <div className="scroll-wrapper--body">{this.props.children}</div>
        </div>
      </div>
    );
  }
}

ScrollContentWrapper.propTypes = propTypes;

export default withRouter(ScrollContentWrapper);
