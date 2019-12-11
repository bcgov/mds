/* eslint-disable */
import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { Button } from "antd";

/**
 * @constant NOWProgressButtons renders the correct actions according to what stage the application is in.
 */

const propTypes = {
  applicationProgress: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  applicationProgressStatusCodes: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings))
    .isRequired,
  handleProgressChange: PropTypes.func.isRequired,
};

export class NOWProgressButtons extends Component {
  state = { label: "Technical Review", value: "REV", isDecision: false };

  componentDidMount() {
    const currentStep = this.props.applicationProgress.length;
    if (currentStep < 3) {
      const label = this.props.applicationProgressStatusCodes[currentStep + 1].description;
      const value = this.props.applicationProgressStatusCodes[currentStep + 1]
        .application_progress_status_code;
      this.setState({ label, value });
    } else {
      this.setState({ isDecision: true });
    }
  }

  renderNextStep = () => {
    this.props.handleProgressChange(this.state.value);
    console.log(this.props.applicationProgressStatusCodes);
  };

  render() {
    return (
      <div>
        {!this.state.isDecision && (
          <button onClick={this.renderNextStep}>{`Proceed to ${this.state.label}`}</button>
        )}
      </div>
    );
  }
}

NOWProgressButtons.propTypes = propTypes;

export default NOWProgressButtons;
