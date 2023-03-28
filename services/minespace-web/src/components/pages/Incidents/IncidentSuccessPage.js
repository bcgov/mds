import React from "react";
import { withRouter, Link } from "react-router-dom";
import { Row, Col, Typography, Button, Divider } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      incident: CustomPropTypes.incident,
    }),
  }).isRequired,
};

export const IncidentSuccessPage = (props) => {
  const renderContent = () => {
    const incident = props.location.state?.incident || {};
    const { mine_incident_guid, mine_guid } = incident;
    return (
      <div style={{ textAlign: "center" }}>
        <>
          <Row>
            <Col span={24}>
              <CheckCircleOutlined className="success-page" />
            </Col>
          </Row>
          <br />
          <Typography.Paragraph>
            <Typography.Title level={5}>
              Thank you, your Mines Incident has been submitted!
            </Typography.Title>
            Your submission will soon be reviewed by the ministry.
          </Typography.Paragraph>
          <Typography.Paragraph>
            This record will now move to the awaiting final investigation stage and requires you to
            visit this record again and upload your investigation documentation.
          </Typography.Paragraph>
          <div>
            <p>
              <Link to={routes.MINE_DASHBOARD.dynamicRoute(mine_guid, "incidents")}>
                <Button type="primary">Back to All incidents</Button>
              </Link>
            </p>
            <p>
              <Link
                to={{
                  pathname: routes.REVIEW_MINE_INCIDENT.dynamicRoute(mine_guid, mine_incident_guid),
                  state: { current: 2 },
                }}
              >
                <Button>View Mine Incident</Button>
              </Link>
            </p>
          </div>
        </>
      </div>
    );
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <Typography.Title>
            Record a Mine Incident - {props.location.state?.incident?.mine_name || ""}
          </Typography.Title>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Link
            to={routes.MINE_DASHBOARD.dynamicRoute(
              props.location.state?.incident?.mine_guid,
              "incidents"
            )}
          >
            <ArrowLeftOutlined className="padding-sm--right" />
            Back to All Incidents
          </Link>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col span={24}>
          <Typography.Title level={4}>Record New Mine Incident</Typography.Title>
        </Col>
        <Col span={24}>{renderContent()}</Col>
      </Row>
    </>
  );
};

IncidentSuccessPage.propTypes = propTypes;

export default withRouter(IncidentSuccessPage);
