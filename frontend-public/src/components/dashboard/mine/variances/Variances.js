import React, { Component } from "react";
import PropTypes from "prop-types";
import { Row, Col } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import CustomPropTypes from "@/customPropTypes";
import { getUserMineInfo } from "@/selectors/userMineSelectors";
import * as routes from "@/constants/routes";

// import * as routes from "@/constants/routes";

const propTypes = {
  mines: CustomPropTypes.userMines.isRequired,
};

// This file is anticipated to use state
// eslint-disable-next-line react/prefer-stateless-function
export class Variances extends Component {
  render() {
    return <div className="user-dashboard-padding">Variances</div>;
  }
}

const mapStateToProps = (state) => ({
  mines: getUserMineInfo(state),
});

Variances.propTypes = propTypes;

export default connect(mapStateToProps)(Variances);
