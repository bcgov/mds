/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Divider } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import StandardPermitConditions from "@/components/Forms/permits/conditions/StandardPermitConditions";

const propTypes = {};

const defaultProps = {};

export class AdminPermitConditionManagement extends Component {
  render() {
    const { type } = this.props.match.params;
    return (
      <div className="tab__content">
        <h2>Permit Conditions</h2>
        <Divider />
        <br />
        <h4>{type} Template Conditions</h4>
        <StandardPermitConditions type={type} />
      </div>
    );
  }
}

AdminPermitConditionManagement.propTypes = propTypes;
AdminPermitConditionManagement.defaultProps = defaultProps;

export default AdminPermitConditionManagement;
