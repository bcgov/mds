import React from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Typography, Button } from "antd";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import LinkButton from "../common/LinkButton";
import { ENVIRONMENT } from "@mds/common/constants";
import * as API from "@mds/common/constants/API";
import { AMS_STATUS_CODE_FAIL } from "@mds/common/constants";

export const ProjectSubmissionStatusPage = () => {
  const { projectGuid, status } = useParams<{ projectGuid: string; status: string }>();

  const downloadIRTTemplate = (url) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  const renderContent = () => {
    let content = (
      <div className="status-page-content">
        <>
          <Row>
            <Col span={24}>
              <CheckCircleOutlined className="success-page" />
            </Col>
          </Row>
          <br />
          <Typography.Paragraph>
            <Typography.Title level={4}>
              Thank you, your application has been submitted successfully!
            </Typography.Title>
            Your submission tracking number and status are available in the Project Description
            Overview. If your application requires an Information Requirements Table (IRT), please
            download the{" "}
            <LinkButton
              onClick={() =>
                downloadIRTTemplate(
                  ENVIRONMENT.apiUrl + API.INFORMATION_REQUIREMENTS_TABLE_TEMPLATE_DOWNLOAD
                )
              }
            >
              IRT template
            </LinkButton>{" "}
            for the next phase.
          </Typography.Paragraph>
          <div>
            <p>
              <Link to={GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(projectGuid)}>
                <Button type="primary">Back to Project Overview</Button>
              </Link>
            </p>
            <p>
              <Link
                to={GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(projectGuid, "project-description")}
              >
                <Button>View Project Description Overview</Button>
              </Link>
            </p>
          </div>
        </>
      </div>
    );

    if (status === AMS_STATUS_CODE_FAIL) {
      content = (
        <div style={{ textAlign: "center" }}>
          <>
            <Row>
              <Col span={24}>
                <CloseCircleOutlined className="fail-page" />
              </Col>
            </Row>
            <br />
            <Typography.Paragraph>
              <Typography.Title level={4}>Submission Failed.</Typography.Title>
              Please retry submission in Project Description Overview in a few minutes.
            </Typography.Paragraph>
            <div>
              <p>
                <Link
                  to={GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(projectGuid, "project-description")}
                >
                  <Button type="primary">View Project Description Overview</Button>
                </Link>
              </p>
            </div>
          </>
        </div>
      );
    }

    return content;
  };

  return (
    <>
      <div className="status-page-container">
        <Row>
          <Col span={24}>
            <Typography.Title level={1}>Create New Project</Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Link
              data-cy="back-to-project-link"
              to={GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(projectGuid)}
            >
              <ArrowLeftOutlined className="padding-sm--right" />
              Back to Project Overview
            </Link>
          </Col>
        </Row>
        <Row>
          <Col span={24}>{renderContent()}</Col>
        </Row>
      </div>
    </>
  );
};

export default ProjectSubmissionStatusPage;
