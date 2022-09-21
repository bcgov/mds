import React, { Component } from "react";
import { connect } from "react-redux";
import { destroy } from "redux-form";
import { withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";
import { Row, Col, Typography, Button } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import * as Strings from "@common/constants/strings";
import PropTypes from "prop-types";
import { openModal, closeModal } from "@common/actions/modalActions";
import { fetchIncidents, createMineIncident } from "@common/actionCreators/incidentActionCreator";
import {
  getDropdownIncidentDeterminationOptions,
  getDropdownIncidentCategoryCodeOptions,
} from "@common/selectors/staticContentSelectors";
import { getIncidents, getIncidentPageData } from "@common/selectors/incidentSelectors";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import { detectProdEnvironment as IN_PROD } from "@/utils/environmentUtils";
import * as FORM from "@/constants/forms";
import * as routes from "@/constants/routes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import IncidentsTable from "@/components/dashboard/mine/incidents/IncidentsTable";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  incidentCategoryCodeOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  fetchIncidents: PropTypes.func.isRequired,
  createMineIncident: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  destroy: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

const defaultProps = {};

export class Incidents extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.handleFetchIncidents();
  }

  handleFetchIncidents = () => {
    this.props
      .fetchIncidents({
        mine_guid: this.props.mine?.mine_guid,
        per_page: Strings.MAX_PER_PAGE,
        sort_dir: "desc",
        sort_field: "mine_incident_report_no",
      })
      .then(() => {
        this.setState({ isLoaded: true });
      });
  };

  handleCreateIncident = (values) => {
    this.setState({ isLoaded: false });
    return this.props.createMineIncident(this.props.mine.mine_guid, values).then(() => {
      this.props.closeModal();
      this.handleFetchIncidents();
    });
  };

  handleCancelMineIncident = () => {
    this.props.destroy(FORM.ADD_INCIDENT);
  };

  openCreateIncidentModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          status_code: "PRE",
          determination_type_code: "PEN",
        },
        onSubmit: this.handleCreateIncident,
        afterClose: this.handleCancelMineIncident,
        title: "Record a Mine Incident",
        mineGuid: this.props.mine.mine_guid,
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
          <AuthorizationWrapper>
            <Button
              style={{ display: "inline", float: "right" }}
              type="primary"
              onClick={(event) =>
                IN_PROD()
                  ? this.openCreateIncidentModal(event)
                  : this.props.history.push({
                      pathname: routes.ADD_MINE_INCIDENT.dynamicRoute(this.props.mine?.mine_guid),
                      state: { mine: this.props.mine },
                    })
              }
            >
              <PlusCircleFilled />
              Record a mine incident
            </Button>
          </AuthorizationWrapper>
          <Typography.Title level={4}>Incidents</Typography.Title>
          <Typography.Paragraph>
            This table shows your mine&apos;s history of&nbsp;
            <Typography.Text className="color-primary" strong>
              reported incidents
            </Typography.Text>
            .
          </Typography.Paragraph>
          <Typography.Paragraph>
            <a
              href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/health-safety/incident-information"
              target="_blank"
              rel="noopener noreferrer"
              alt="Incident Information"
            >
              Click here
            </a>{" "}
            for more information on mining incidents and dangerous occurrences in British Columbia.
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
  incidents: getIncidents(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchIncidents,
      createMineIncident,
      destroy,
      openModal,
      closeModal,
    },
    dispatch
  );

Incidents.propTypes = propTypes;
Incidents.defaultProps = defaultProps;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Incidents));
