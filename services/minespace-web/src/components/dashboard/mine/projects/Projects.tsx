import React, { FC, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Typography, Button } from "antd";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import { fetchProjectsByMine } from "@mds/common/redux/actionCreators/projectActionCreator";
import { getProjects } from "@mds/common/redux/selectors/projectSelectors";
import ProjectTable from "@/components/dashboard/mine/projects/ProjectsTable";
import * as routes from "@/constants/routes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { IMine } from "@mds/common/interfaces/mine.interface";

export const Projects: FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const dispatch = useDispatch();
  const projects = useSelector(getProjects);

  const handleFetchData = () => {
    dispatch(fetchProjectsByMine({ mineGuid: mine.mine_guid })).then(() => {
      setIsLoaded(true);
    });
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={1}>Major Mine Applications</Typography.Title>
        <Typography.Paragraph>
          A{" "}
          <Typography.Text className="color-primary" strong>
            Major Mine Application&nbsp;
          </Typography.Text>
          is an application to the Chief Permitting Officer to authorize the construction and
          operation of a coal or mineral mine through a permit issued under the Mines Act.{" "}
        </Typography.Paragraph>
        <Typography.Paragraph>
          If you are proposing induced polarization surveys or exploration drilling within the
          permit mine area of an operating production mineral or coal mine (
          <a
            href="https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/mineral-exploration-mining/documents/health-and-safety/code-review/health_safety_and_reclamation_code_apr2021.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            HSRC
          </a>
          &nbsp;10.1.2), please submit a&nbsp;
          <a
            href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/mines-act-deemed-authorizations"
            target="_blank"
            rel="noopener noreferrer"
          >
            Notification of Deemed Authorization
          </a>
          &nbsp;application through&nbsp;
          <a
            href="https://portal.nrs.gov.bc.ca/web/client/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            FrontCounter BC
          </a>
          .
        </Typography.Paragraph>
        <Typography.Paragraph>
          If you are proposing exploration work (
          <a
            href="https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/mineral-exploration-mining/documents/health-and-safety/code-review/health_safety_and_reclamation_code_apr2021.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            HSRC
          </a>
          &nbsp;9.1.1) outside of the permit mine area of an operating production mineral or coal
          mine that does not consist of an expansion to the production mining area, please submit a
          Notice of Work application through{" "}
          <a
            href="https://portal.nrs.gov.bc.ca/web/client/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            FrontCounter BC
          </a>
          &nbsp;to amend your MX or CX permit.
        </Typography.Paragraph>
        <Typography.Paragraph>
          If you are unsure how to proceed, please email the Major Mines Office at&nbsp;
          <a href="mailto:permrecl@gov.bc.ca">permrecl@gov.bc.ca</a>&nbsp;or contact the&nbsp;
          <a
            href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/mines-contact-info"
            target="_blank"
            rel="noopener noreferrer"
          >
            Regional Mines Office
          </a>
          &nbsp;closest to your project location.
        </Typography.Paragraph>
        <Typography.Paragraph>
          <AuthorizationWrapper>
            <Link to={routes.ADD_PROJECT_SUMMARY.dynamicRoute(mine.mine_guid)}>
              <Button type="primary" disabled={!isLoaded}>
                <PlusCircleFilled />
                Create New Project
              </Button>
            </Link>
          </AuthorizationWrapper>
        </Typography.Paragraph>
        <ProjectTable projects={projects} mine={mine} isLoaded={isLoaded} />
      </Col>
    </Row>
  );
};

export default Projects;
