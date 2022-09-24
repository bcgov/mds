import React from "react";
import { withRouter, Link } from "react-router-dom";
import { Row, Col, Typography, Button, Divider } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
      mineIncidentGuid: PropTypes.string,
    }),
  }).isRequired,
  location: PropTypes.shape({
    state: {
      mine: CustomPropTypes.mine,
    },
  }).isRequired,
};

export const IncidentsSuccessPage = (props) => {
  const renderContent = () => {
    const mine = props.location.state?.mine || {};
    const {
      mine_guid,
      // eslint-disable-next-line no-unused-vars
      incident: { mine_incident_guid, mine_determination_type_code },
    } = mine;

    return (
      <div style={{ textAlign: "center" }}>
        <>
          <Row>
            <Col span={24}>
              <CheckCircleOutlined
                style={{
                  color: "green",
                  transform: "scale(7.0)",
                  marginTop: "7.0em",
                  marginBottom: "3.5em",
                }}
              />
            </Col>
          </Row>
          <br />
          <Typography.Paragraph>
            <Typography.Title level={5}>
              Thank you, your Mines Incident has been submitted!
            </Typography.Title>
            Your submission will soon be reviewed by the ministry.
          </Typography.Paragraph>
          {mine_determination_type_code && (
            <Typography.Paragraph>
              This record will now move to the awaiting final investigation stage and requires you
              to visit this record again and upload your investigation documentation.
            </Typography.Paragraph>
          )}
          <div>
            <p>
              <Link
                to={routes.MINE_DASHBOARD.dynamicRoute(props.match.params?.mineGuid, "incidents")}
              >
                <Button type="primary">Back to All incidents</Button>
              </Link>
            </p>
            <p>
              <Link
                to={{
                  pathname: routes.MINE_DASHBOARD.dynamicRoute(mine_guid),
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
            Record a Mine Incident - {props.location.state?.mine?.mine_name || ""}
          </Typography.Title>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Link to={routes.MINE_DASHBOARD.dynamicRoute(props.match.params?.mineGuid, "incidents")}>
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

IncidentsSuccessPage.propTypes = propTypes;

export default withRouter(IncidentsSuccessPage);
