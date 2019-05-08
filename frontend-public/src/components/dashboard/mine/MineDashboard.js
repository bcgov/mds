import React, { Component } from "react";
import PropTypes from "prop-types";
import QuestionSidebar from "@/components/common/QuestionsSidebar";
import { Link } from "react-router-dom";
import * as routes from "@/constants/routes";

// import * as routes from "@/constants/routes";

const propTypes = {
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
};

// This file is anticipated to use state
// eslint-disable-next-line react/prefer-stateless-function
export class MineDashboard extends Component {
  componentDidMount() {}

  render() {
    const { id } = this.props.match.params;
    return (
      <div className="user-dashboard-padding">
        <h1> this page is a mess</h1>
        <div>
          <Link to={routes.REPORTS.dynamicRoute(id)}>Reporting</Link>
        </div>
        <div>
          <Link to={routes.VARIANCES.dynamicRoute(id)}>Variances</Link>
        </div>
        <QuestionSidebar />
      </div>
    );
  }
}

MineDashboard.propTypes = propTypes;

export default MineDashboard;
