import { Alert, Button, Checkbox, Col, Form, Row, Space, Typography } from "antd";
import React, { FC, useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { IMine } from "@mds/common/interfaces";
import { useDispatch, useSelector } from "react-redux";
import * as routes from "@/constants/routes";
import { MINE_DASHBOARD } from "@/constants/routes";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import Loading from "@mds/common/components/common/Loading";

interface IParams {
  mineGuid: string;
}

const ProjectStartPage: FC = () => {
  const { mineGuid } = useParams<IParams>();
  const dispatch = useDispatch();
  const history = useHistory();
  const mine: IMine = useSelector(getMineById(mineGuid));
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (mineGuid && !mine) {
        dispatch(fetchMineRecordById(mineGuid));
      }
    };

    fetchData();
  }, [mineGuid, dispatch]);

  useEffect(() => {
    if (mine && !isLoaded) {
      setIsLoaded(true);
    }
  }, [mine]);

  const handleSubmit = () => {
    history.push(routes.ADD_PROJECT_SUMMARY.dynamicRoute(mineGuid));
  };

  const handleCheckboxChange = (checkedValues: string[]) => {
    setSelectedOptions(checkedValues);
  };

  if (!isLoaded) {
    return <Loading />;
  }

  // Create options for Checkbox.Group
  const options = [
    { label: "Mines Act Permit", value: "application_type_mines_act" },
    {
      label:
        "Environmental Management Act (EMA) Permit or Approval for air emissions, effluent or refuse discharge",
      value: "application_type_ema_air",
    },
  ];

  return (
    <div>
      <Typography.Title level={1}>New Project - {mine?.mine_name}</Typography.Title>
      <Row className="margin-large--bottom">
        <Col span={24}>
          <Link
            to={routes.MINE_DASHBOARD.dynamicRoute(mineGuid, "applications")}
            className="back-link"
          >
            <ArrowLeftOutlined className="padding-sm--right" /> Back to: Projects page
          </Link>
        </Col>
      </Row>
      <Typography.Title level={3}>Submit Application</Typography.Title>
      <div className="project-getting-started">
        <Typography.Title level={3}>Getting Started with your Project Description</Typography.Title>
        <Typography.Paragraph>
          You are submitting a Major Mine Application to the Chief Permitting Officer.
        </Typography.Paragraph>
        <Typography.Title level={4}>
          What type of application are you submitting today?
        </Typography.Title>
        <Typography.Title level={5}>
          New major operations or amendments requiring a ministry decision
        </Typography.Title>
        <Form.Item validateStatus={selectedOptions.length === 0 ? "error" : ""}>
          <Checkbox.Group
            options={options}
            onChange={handleCheckboxChange}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          />
        </Form.Item>
        <Alert
          type="info"
          showIcon
          className="margin-large--top margin-large--bottom"
          description={
            <Typography.Paragraph className="margin-none--bottom">
              If applicable, please refer to{" "}
              <a
                href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/coordinated-authorizations"
                target="_blank"
              >
                coordinated authorizations
              </a>{" "}
              for The <i>Mines Act/Environmental Management Act</i> Joint Application Information
              Requirements (JAIR) guidance document and accompanying Information Requirements Table
              (IRT).
            </Typography.Paragraph>
          }
        />
        <Typography.Paragraph>
          Submit a{" "}
          <Link to={MINE_DASHBOARD.dynamicRoute(mine?.mine_guid, "nods")}>Notice of Departure</Link>{" "}
          through MineSpace as per{" "}
          <a
            href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/health-safety/health-safety-and-reclamation-code-for-mines-in-british-columbia"
            target="_blank"
            rel="noopener noreferrer"
          >
            BC's Health, Safety, and Reclamation Code
          </a>
          .
        </Typography.Paragraph>
        <Typography.Paragraph strong className="margin-none--bottom">
          Exploration outside the permitted mine area (not expanding production)
        </Typography.Paragraph>
        <Typography.Paragraph>
          Submit a Notice of Work application through{" "}
          <a
            href="https://portal.nrs.gov.bc.ca/web/client/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            FrontCounter BC Online
          </a>
          .
        </Typography.Paragraph>
        <Typography.Paragraph strong className="margin-none--bottom">
          Induced polarization surveys or exploration drilling within the permitted mine area
        </Typography.Paragraph>
        <Typography.Paragraph>
          Submit a Notification of Deemed Authorization through{" "}
          <a
            href="https://portal.nrs.gov.bc.ca/web/client/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            FrontCounter BC Online
          </a>
          .
        </Typography.Paragraph>
        <Typography.Paragraph strong className="margin-none--bottom">
          Registration and Changes to an Existing Registration under the EMA’s Municipal Wastewater
          Regulation, Hazardous Waste Regulation or Petroleum Storage and Distribution Facilities
          Storm Water Regulation:
        </Typography.Paragraph>
        <Typography.Paragraph>
          Submit an application to the Ministry of Environment and Parks according to the{" "}
          <a
            target="_blank"
            href="https://www2.gov.bc.ca/gov/content/environment/waste-management/waste-discharge-authorization/apply"
          >
            new authorization
          </a>{" "}
          or{" "}
          <a
            target="_blank"
            href="https://www2.gov.bc.ca/gov/content/environment/waste-management/waste-discharge-authorization/change"
          >
            change a waste discharge authorization
          </a>{" "}
          guideline.
        </Typography.Paragraph>
        <Typography.Title level={4}> Applications Not Accepted on This Page:</Typography.Title>
        <Typography.Paragraph strong className="margin-none--bottom">
          Depart from an authorized mine plan and reclamation program
        </Typography.Paragraph>
        <Typography.Paragraph>
          For all other applications relating to your mine, please contact the appropriate Ministry
        </Typography.Paragraph>
      </div>

      <div className="form-buttons right">
        <Space>
          <Link to={routes.MINE_DASHBOARD.dynamicRoute(mineGuid, "projects")}>
            <Button>Cancel</Button>
          </Link>
          <Button type="primary" onClick={handleSubmit} disabled={selectedOptions.length === 0}>
            Create Project Description
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ProjectStartPage;
