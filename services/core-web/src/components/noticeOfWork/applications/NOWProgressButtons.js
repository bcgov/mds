/* eslint-disable */
import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { Button } from "antd";

/**
 * @constant NOWProgressButtons renders the correct actions according to what stage the application is in.
 */

const propTypes = {
  applicationProgress: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)),
  applicationProgressStatusCodes: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)),
  handleProgressChange: PropTypes.func.isRequired,
  isImported: PropTypes.bool.isRequired,
};

const defaultProps = {
  applicationProgressStatusCodes: [],
  applicationProgress: [],
};

export class NOWProgressButtons extends Component {
  state = { label: "Technical Review", value: "REV", isDecision: false };

  componentDidMount() {
    const currentStep = this.props.applicationProgress.length;
    if (currentStep < 3 && this.props.applicationProgressStatusCodes.length !== 0) {
      const label = this.props.applicationProgressStatusCodes[currentStep + 1].description;
      const value = this.props.applicationProgressStatusCodes[currentStep + 1]
        .application_progress_status_code;
      this.setState({ label, value });
    } else {
      this.setState({ isDecision: true });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.applicationProgress !== this.props.applicationProgress) {
      console.log(nextProps.applicationProgress);
    }
  }

  renderNextStep = () => {
    this.props.handleProgressChange(this.state.value);
  };

  render() {
    const isStartOrEnd = this.state.isDecision || !this.props.isImported;
    return (
      <span>
        {isStartOrEnd && (
          <button onClick={this.renderNextStep}>{`Start ${this.state.label}`}</button>
        )}
      </span>
    );
  }
}

NOWProgressButtons.propTypes = propTypes;
NOWProgressButtons.defaultProps = defaultProps;

export default NOWProgressButtons;
