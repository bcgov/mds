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
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

const defaultProps = {
  applicationProgressStatusCodes: [],
  applicationProgress: [],
};

export class NOWProgressButtons extends Component {
  renderNextStep = () => {
    this.props.handleProgressChange(this.props.value);
  };

  render() {
    return (
      <span>
        <button onClick={this.renderNextStep}>{`Start ${this.props.label}`}</button>
      </span>
    );
  }
}

NOWProgressButtons.propTypes = propTypes;
NOWProgressButtons.defaultProps = defaultProps;

export default NOWProgressButtons;
