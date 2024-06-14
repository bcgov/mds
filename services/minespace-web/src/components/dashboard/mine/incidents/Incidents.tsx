import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Col, Row, Typography } from "antd";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import { fetchIncidents } from "@mds/common/redux/actionCreators/incidentActionCreator";
import { getIncidentPageData, getIncidents } from "@mds/common/redux/selectors/incidentSelectors";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE, IMine } from "@mds/common";
import * as routes from "@/constants/routes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import IncidentsTable from "@/components/dashboard/mine/incidents/IncidentsTable";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";

export const Incidents = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isLoaded, setIsLoaded] = useState(false);
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const incidentPageData = useSelector(getIncidentPageData);
  const incidents = useSelector(getIncidents);

  const handleFetchIncidents = async (params?) => {
    const fetchParams = params || {
      page: DEFAULT_PAGE,
      per_page: DEFAULT_PER_PAGE,
      sort_dir: "desc",
      sort_field: "mine_incident_report_no",
    };
    await dispatch(
      fetchIncidents({
        ...fetchParams,
        mine_guid: mine.mine_guid,
      })
    );
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
            type="primary"
            className="dashboard-add-button"
            onClick={() =>
              history.push({
                pathname: routes.ADD_MINE_INCIDENT.dynamicRoute(mine.mine_guid),
                state: { mine },
              })
            }
          >
            <PlusCircleFilled />
            Record a mine incident
          </Button>
        </AuthorizationWrapper>
        <Typography.Title level={1}>Incidents</Typography.Title>
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
        {/* <IncidentsTable
          isLoaded={isLoaded}
          data={incidents}
          pageData={incidentPageData}
          handleSearch={handleFetchIncidents}
        /> */}
      </Col>
    </Row>
  );
};

export default Incidents;
