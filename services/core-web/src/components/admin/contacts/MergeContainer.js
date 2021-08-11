/* eslint-disable */
import React, { Component } from "react";
import { Row, Col, Tabs } from "antd";
import PropTypes from "prop-types";

const propTypes = {
  partyType: PropTypes.bool.isRequired,
};

const partyTypeLabel = {
  PER: "Person",
  ORG: "Company",
};

export class MergeContainer extends Component {
  render() {
    return (
      <div>
        <h4>Merge {partyTypeLabel[this.props.partyType]}</h4>
      </div>
    );
  }
}

MergeContainer.propTypes = propTypes;

export default MergeContainer;
