import React, { Component } from "react";
// TODO: use our custom axios instance
import axios from "axios";

export class ReportingDashboard extends Component {
  state = {};

  componentWillMount() {
    axios
      .get(`${process.env.BASE_PATH}/metabase-token`, {
        headers: {
          Authorization: "authtoken",
        },
      })
      // TODO: Safely handle unauthorized / failed request
      .then((res) => {
        const { dashboardUrl } = res.data ? res.data : {};
        this.setState({ dashboardUrl });
      })
      .catch(console.error);
  }

  render() {
    const iframeUrl = `${this.state.dashboardUrl}#bordered=true&titled=false`;
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
