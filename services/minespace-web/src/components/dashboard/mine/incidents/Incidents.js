import React, { Component } from "react";
import { connect } from "react-redux";
import { destroy } from "redux-form";
import { bindActionCreators } from "redux";
import { Row, Col, Typography, Button } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import PropTypes from "prop-types";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  fetchMineIncidents,
  createMineIncident,
} from "@common/actionCreators/incidentActionCreator";
import {
  getDropdownIncidentDeterminationOptions,
  getDropdownIncidentStatusCodeOptions,
  getDropdownIncidentCategoryCodeOptions,
} from "@common/selectors/staticContentSelectors";
import { getIncidents, getIncidentPageData } from "@common/selectors/incidentSelectors";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";

import IncidentsTable from "@/components/dashboard/mine/incidents/IncidentsTable";

const propTypes = {
  fetchMineIncidents: PropTypes.func.isRequired,
  createMineIncident: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  incidentCategoryCodeOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {};

export class Incidents extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchMineIncidents(this.props.mineGuid).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  handleCreateIncident = (values) => {
    console.log("handleCreateIncident values: ", values);
    console.log("this.props.mine.mine_guid: ", this.props.mineGuid);
    return this.props.createMineIncident(this.props.mineGuid, values).then(() => {
      this.props.closeModal();
      this.props.fetchMineIncidents(this.props.mineGuid);
    });
  };

  openCreateIncidentModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleCreateIncident,
        title: "Record a mine incident",
        mineGuid: this.props.mineGuid,
        incidentDeterminationOptions: this.props.incidentDeterminationOptions,
        incidentCategoryCodeOptions: this.props.incidentCategoryCodeOptions,
      },
      content: modalConfig.ADD_INCIDENT,
    });
  };

  render() {
    return (
      <Row>
        <Col span={24}>
          <Button
            style={{ display: "inline", float: "right" }}
            type="primary"
            onClick={(event) => this.openCreateIncidentModal(event)}
          >
            <PlusCircleFilled />
            Record a mine incident
          </Button>
          <Typography.Title level={4}>Incidents</Typography.Title>
          <Typography.Paragraph>
            This table shows your mine&apos;s history of&nbsp;
            <Typography.Text className="color-primary" strong>
              reported incidents
            </Typography.Text>
            .
          </Typography.Paragraph>
          <IncidentsTable isLoaded={this.state.isLoaded} data={this.props.incidents} />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  incidentPageData: getIncidentPageData(state),
  incidentCategoryCodeOptions: getDropdownIncidentCategoryCodeOptions(state),
  incidentDeterminationOptions: getDropdownIncidentDeterminationOptions(state),
  incidentStatusCodeOptions: getDropdownIncidentStatusCodeOptions(state),
  incidents: getIncidents(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineIncidents,
      createMineIncident,
      destroy,
      openModal,
      closeModal,
    },
    dispatch
  );

Incidents.propTypes = propTypes;
Incidents.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Incidents);
