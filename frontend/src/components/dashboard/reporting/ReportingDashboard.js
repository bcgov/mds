import React, { Component } from "react";
// TODO: use our custom axios instance
import axios from "axios";

export class ReportingDashboard extends Component {
  state = {};

  componentWillMount() {
    axios
      .get(`http://localhost:5000/reporting/core-dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
      })
      // TODO: Safely handle unauthorized / failed request
      .then((res) => {
        const { dashboard_url } = res.data ? res.data : {};
        this.setState({ dashboard_url });
      })
      .catch(console.error);
  }

  render() {
    const iframeUrl = `${this.state.dashboard_url}#bordered=true&titled=false`;
    return (
      <iframe
        title="metabaseDashboard"
        src={iframeUrl}
        frameBorder="0"
        width="100%"
        height="2700px"
        allowTransparency
      />
    );
  }
}

export default ReportingDashboard;
