/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";

const propTypes = {};

const defaultProps = {};

export class AdminPermitConditionManagement extends Component {
  render() {
    return (
      <div>
        <h1>Permit Conditions will go here</h1>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

AdminPermitConditionManagement.propTypes = propTypes;
AdminPermitConditionManagement.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(AdminPermitConditionManagement);
