import React from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col, Typography, Button, Divider } from "antd";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { useHistory } from "react-router-dom";

interface EnvironmentalManagementActApplicationSuccessPageProps {
    location?: {
        state?: {
            projectTitle?: string;
        };
    };
}

export const EMAApplicationSuccessPage: React.FC<EnvironmentalManagementActApplicationSuccessPageProps> = (props) => {
    const state = props.location.state || {};
    const {
        projectTitle,
    } = state

    const { projectGuid, projectSummaryGuid, projectSummaryAuthorizationGuid } = useParams<{
        projectGuid: string;
        projectSummaryGuid: string;
        projectSummaryAuthorizationGuid: string;
    }>();
    const history = useHistory();

    const viewApplicationButton = () => {
        history.push(
            GLOBAL_ROUTES?.AMS_FINAL_APPLICATION.dynamicRoute(
                projectGuid,
                projectSummaryGuid,
                projectSummaryAuthorizationGuid,
            )
        );
    };

    const renderContent = () => {
        return (
            <div style={{ textAlign: "center" }}>
                <Row>
                    <Col span={24}>
                        <CheckCircleOutlined className="success-page" />
                    </Col>
                </Row>
                <br />
                <Typography.Paragraph>
                    <Typography.Title level={4}>
                        Thank you, your Environmental Management Act Application has been submitted!
                    </Typography.Title>
                    Your submission will soon be reviewed by the ministry.
                </Typography.Paragraph>
                <div>
                    <p>
                        <Link to={GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(projectGuid)}>
                            <Button type="primary">Back to Project Overview</Button>
                        </Link>
                    </p>
                    <p>
                        <Button onClick={viewApplicationButton}>View Application</Button>
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="status-page-container">
            <Row>
                <Col span={24}>
                    <Typography.Title>{projectTitle}</Typography.Title>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Link to={GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(projectGuid)}>
                        <ArrowLeftOutlined className="padding-sm--right" />
                        Back to Project Overview
                    </Link>
                </Col>
            </Row>
            <Divider />
            <Row>
                <Col span={24}>
                    <Typography.Title level={4}>Environmental Management Act Application</Typography.Title>
                </Col>
                <Col span={24}>{renderContent()}</Col>
            </Row>
        </div>
    );
};

export default EMAApplicationSuccessPage;
