import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography } from "antd";
import * as Strings from "@common/constants/strings";
import PropTypes from "prop-types";
import { fetchIncidents } from "@common/actionCreators/incidentActionCreator";
import { getIncidents, getIncidentPageData } from "@common/selectors/incidentSelectors";
import CustomPropTypes from "@/customPropTypes";

import IncidentsTable from "@/components/dashboard/mine/incidents/IncidentsTable";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  fetchIncidents: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
};

export class Incidents extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props
      .fetchIncidents({
        mine_guid: this.props.mine.mine_guid,
        per_page: Strings.MAX_PER_PAGE,
        sort_dir: "asc",
        sort_field: "mine_incident_report_no",
      })
      .then(() => {
        this.setState({ isLoaded: true });
      });
  }

  render() {
    return (
      <Row>
        <Col>
          <Title level={4}>Incidents</Title>
          <Paragraph>
            This table shows your mine&apos;s history of&nbsp;
            <Text className="color-primary" strong>
              reported incidents
            </Text>
            .
          </Paragraph>
          <IncidentsTable isLoaded={this.state.isLoaded} data={this.props.incidents} />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  incidentPageData: getIncidentPageData(state),
  incidents: getIncidents(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchIncidents,
    },
    dispatch
  );

Incidents.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(Incidents);
