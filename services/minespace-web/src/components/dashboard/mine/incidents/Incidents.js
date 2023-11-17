import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { destroy } from "redux-form";
import { withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";
import { Button, Col, Row, Typography } from "antd";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import PropTypes from "prop-types";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { createMineIncident, fetchIncidents } from "@mds/common/redux/actionCreators/incidentActionCreator";
import {
  getDropdownIncidentCategoryCodeOptions,
  getDropdownIncidentDeterminationOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getIncidentPageData, getIncidents } from "@mds/common/redux/selectors/incidentSelectors";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "@mds/common";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import IncidentsTable from "@/components/dashboard/mine/incidents/IncidentsTable";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  incidents: PropTypes.arrayOf(CustomPropTypes.incident).isRequired,
  incidentPageData: CustomPropTypes.incidentPageData.isRequired,
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

export const Incidents = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const {
    mine,
    incidents,
    incidentPageData,
    incidentCategoryCodeOptions,
    incidentDeterminationOptions,
    history,
  } = props;

  const handleFetchIncidents = async (params) => {
    const fetchParams = params || {
      page: DEFAULT_PAGE,
      per_page: DEFAULT_PER_PAGE,
      sort_dir: "desc",
      sort_field: "mine_incident_report_no",
    };
    await props.fetchIncidents({
      ...fetchParams,
      mine_guid: mine?.mine_guid,
    });
    setIsLoaded(true);
  };

  useEffect(() => {
    handleFetchIncidents();
  }, []);

  return (
    <Row>
      <Col span={24}>
        <AuthorizationWrapper>
          <Button
            style={{ display: "inline", float: "right" }}
            type="primary"
            onClick={(event) =>
              history.push({
                pathname: routes.ADD_MINE_INCIDENT.dynamicRoute(mine?.mine_guid),
                state: { mine },
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
            reported incidents.
          </Typography.Text>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <a
            href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/health-safety/incident-information"
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here
          </a>{" "}
          for more information on reportable incidents.
        </Typography.Paragraph>
        <IncidentsTable
          isLoaded={isLoaded}
          data={incidents}
          pageData={incidentPageData}
          handleSearch={handleFetchIncidents}
        />
      </Col>
    </Row>
  );
};

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
