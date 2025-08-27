import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { useHistory, Link } from "react-router-dom";
import { Row, Col, Typography, Button, Alert, Badge, List, Card, Descriptions } from "antd";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import {
    fetchProjectSummaryEnvironmentAuthorizationStatuses,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import {
    AMS_STATUS_CODES_SUCCESS,
    WASTE_DISCHARGE_NEW_AUTHORIZATIONS_URL,
    WASTE_DISCHARGE_AMENDMENT_AUTHORIZATIONS_URL,
    AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES_TEXT,
    AMS_AUTHORIZATION_TYPES_TEXT,
    AMS_APPROVED_STATUSES,
    EMPTY_FIELD,
} from "@mds/common/constants/strings";
import { PresetStatusColorType } from "antd/es/_util/colors";
import Loading from "@mds/common/components/common/Loading";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";

const EmaApplicationsTab = () => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [isLoaded, setIsLoaded] = useState(true);
    const systemFlag = useAppSelector(getSystemFlag);
    const { isFeatureEnabled } = useFeatureFlag();
    const amsFinalAppEnabled = isFeatureEnabled(Feature.AMS_FINAL_APPLICATION);
    const isCore = systemFlag === SystemFlagEnum.core;
    const project = useAppSelector(getProject);
    const authorizations = project?.project_summary?.authorizations;
    const hasMinesActApp = authorizations?.some(auth => !auth.ams_tracking_number);
    const [emaAuths, setEmaAuths] = useState([]);

    console.log("project!");
    console.log(project)

    const renderProjectContactsCard = (contacts = []) => {
        return (
            <Card title="Project Contacts">
                {contacts.map((c) => {
                    const isPrimary = c.is_primary;
                    const hasJobTitle = c.job_title;
                    const name = [c?.first_name, c?.last_name].join(" ").trim();
                    let title: string;
                    if (isPrimary) {
                        title = "Primary Contact";
                    } else if (hasJobTitle) {
                        title = c.job_title;
                    }
                    return (
                        <Typography.Paragraph className="ministry-contact-item" key={c.project_contact_guid}>
                            {title && (
                                <Typography.Text strong className="ministry-contact-title">
                                    {title}
                                </Typography.Text>
                            )}
                            <br />
                            <Typography.Text>{name || EMPTY_FIELD}</Typography.Text>
                            <br />
                            <Typography.Text>{c.phone_number}</Typography.Text>
                            <br />
                            <Typography.Text>
                                <a href={`mailto:${c.email}`}>{c.email}</a>
                            </Typography.Text>
                        </Typography.Paragraph>
                    );
                })}
            </Card>
        );
    };

    useEffect(() => {
        const amsAuthorizations = authorizations?.filter(
            auth => auth.ams_tracking_number && auth.ams_tracking_number !== "0"
        );
        const amsTrackingNumbers = amsAuthorizations?.map(auth => auth.ams_tracking_number);
        setIsLoaded(false);
        dispatch(fetchProjectSummaryEnvironmentAuthorizationStatuses(amsTrackingNumbers)).then((statuses) => {
            console.log("statuses!")
            console.log(statuses);
            const emaAuthsData = amsAuthorizations.map(auth => {
                const match = statuses.find(status => status?.ams_tracking_number === auth.ams_tracking_number);
                return {
                    ...auth,
                    status: match?.status,
                    ams_authorization_number: match?.ams_authorization_number,
                }
            })
            setEmaAuths(emaAuthsData);
            setIsLoaded(true);
        });
    }, [authorizations]);

    return (
        <>
            {isLoaded ? (
                <Row gutter={[0, 16]}>
                    <Col lg={{ span: 14 }} xl={{ span: 16 }}>
                        <Row justify="space-between">
                            <Col>
                                <Typography.Title level={2}>Environmental Management Act Final Applications</Typography.Title>
                            </Col>
                        </Row>
                        {!isCore && (
                            <Col span={24}>
                                <Typography.Paragraph>
                                    This stage relates to submission of a Final Application for a new authorization or authorization amendment.
                                    Please refer to the {" "}
                                    <Link to={{ pathname: WASTE_DISCHARGE_NEW_AUTHORIZATIONS_URL }} target="_blank">
                                        new authorization
                                    </Link> {" "} or {" "}
                                    <Link to={{ pathname: WASTE_DISCHARGE_AMENDMENT_AUTHORIZATIONS_URL }} target="_blank">
                                        authorization amendment
                                    </Link> {" "}
                                    guidelines before submitting your final application package.
                                </Typography.Paragraph>
                            </Col>)}

                        {hasMinesActApp && <Alert
                            className={isCore ? "ant-alert-grey" : ""}
                            description={
                                <div>
                                    <Typography.Text>
                                        <b>Submission Reminder: Mines Act Authorization Included</b>
                                        <br />
                                        If your application includes a <i>Mine Act</i> Authorization, and there are files that apply to the entire application package--
                                        such as shared environmental studies, engineering designs, or other supporting documents--these must be submitted under the
                                        Mines Act and Joint Application submission process.
                                        <br />
                                        For questions or clarification, contact the Major Mines Office before submitting.
                                    </Typography.Text>
                                </div>}
                            showIcon
                        />}
                        <List
                            itemLayout="vertical"
                            dataSource={emaAuths}
                            renderItem={(item) => {
                                return <List.Item key={item.ams_tracking_number} className="grey-box margin-medium--top margin-medium--bottom">
                                    <Descriptions
                                        title={
                                            <span className={isCore ? "violet" : ""}>
                                                {AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES_TEXT[item.project_summary_authorization_type]} [{item.ams_tracking_number}]
                                            </span>
                                        }
                                        size="middle"
                                        column={2}
                                    >
                                        <Descriptions.Item label="Type">{AMS_AUTHORIZATION_TYPES_TEXT[item.project_summary_permit_type[0]]}</Descriptions.Item>
                                        <Descriptions.Item label="" style={{ float: "right", marginLeft: "auto" }}>
                                            <Badge
                                                status={AMS_STATUS_CODES_SUCCESS as PresetStatusColorType}
                                                text={AMS_APPROVED_STATUSES[item.status]}
                                            />
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Authorization Number">
                                            {item.project_summary_permit_type[0] === "NEW" ? EMPTY_FIELD : item.ams_authorization_number}
                                        </Descriptions.Item>
                                    </Descriptions>
                                    {
                                        amsFinalAppEnabled && (
                                            <Button onClick={() => history.push(
                                                GLOBAL_ROUTES?.AMS_FINAL_APPLICATION.dynamicRoute(
                                                    project.project_guid,
                                                    project.project_summary.project_summary_guid,
                                                    item.project_summary_authorization_guid
                                                )
                                            )} type="primary">
                                                Manage Final Application
                                            </Button>
                                        )
                                    }
                                </List.Item>
                            }}>

                        </List>
                    </Col >
                    {!isCore && <Col lg={{ span: 9, offset: 1 }} xl={{ span: 7, offset: 1 }}>
                        <Row gutter={[0, 16]}>
                            {/* WILL HAVE TO CHANGE TO USE TARA's COMPONENT */}
                            <Col span={24}>{renderProjectContactsCard(project.contacts)}</Col>
                        </Row>
                    </Col>
                    }
                </Row >
            ) : (
                <Loading />
            )}
        </>
    )
}

export default EmaApplicationsTab;