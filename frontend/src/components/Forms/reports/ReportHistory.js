import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider } from "antd";

const propTypes = {};

const defaultProps = {};

export class ReportHistory extends Component {
  render = () => (
    <Divider orientation="left">
      <h5>History</h5>
    </Divider>
  );
}

ReportHistory.propTypes = propTypes;
ReportHistory.defaultProps = defaultProps;

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReportHistory);
