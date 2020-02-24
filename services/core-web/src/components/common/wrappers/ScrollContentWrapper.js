/* eslint-disable */
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { includes, isEmpty } from "lodash";
import { PropTypes } from "prop-types";

import NullScreen from "@/components/common/NullScreen";

/**
 * @constant ScrollContentWrapper renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  history: PropTypes.shape({
    location: PropTypes.shape({ state: PropTypes.shape({ currentActiveLink: PropTypes.string }) }),
  }).isRequired,
  showContent: PropTypes.bool,
  data: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  showContent: true,
  data: undefined,
};

export class ScrollContentWrapper extends Component {
  state = { isEmpty: false, isVisible: true };

  componentDidMount() {
    if (this.props.data !== undefined && isEmpty(this.props.data)) {
      this.setState({ isVisible: false });
    }
  }

  toggleContent = () => {
    this.setState({ isVisible: true });
  };

  renderCorrectView = () =>
    this.state.isVisible ? (
      this.props.showContent ? (
        <span>{this.props.children}</span>
      ) : (
        <NullScreen type="now-activity" message={this.props.title} />
      )
    ) : (
      <div>Not Visible</div>
    );

  render() {
    const isActive = () => {
      const currentActiveLink =
        this.props.history && this.props.history.location && this.props.history.location.state
          ? this.props.history.location.state.currentActiveLink
          : undefined;
      const isActiveLink = includes(currentActiveLink, this.props.id);
      return isActiveLink ? "circle purple" : "circle grey";
    };
    console.log(this.props.data);
    console.log(isEmpty(this.props.data));

    return (
      <div className="scroll-wrapper">
        <div className="inline-flex">
          <div className={isActive()} />
          <div id={this.props.id}>
            <div className="scroll-wrapper--title">
              <h3>{this.props.title}</h3>
            </div>
          </div>
        </div>
        <div className="scroll-wrapper--border">
          <div className="scroll-wrapper--body">{this.renderCorrectView()}</div>
        </div>
      </div>
    );
  }
}

ScrollContentWrapper.propTypes = propTypes;
ScrollContentWrapper.defaultProps = defaultProps;

export default withRouter(ScrollContentWrapper);
