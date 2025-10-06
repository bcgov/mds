import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { useHistory, Link } from "react-router-dom";
import { Row, Col, Typography, Button, Alert, Badge, List, Descriptions, Modal, Tooltip } from "antd";
import FormOutlined from "@ant-design/icons/FormOutlined";
import { getSystemFlag, userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import {
    fetchProjectSummaryEnvironmentAuthorizationStatuses,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import {
    WASTE_DISCHARGE_NEW_AUTHORIZATIONS_URL,
    WASTE_DISCHARGE_AMENDMENT_AUTHORIZATIONS_URL,
    AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES_TEXT,
    AMS_AUTHORIZATION_TYPES_TEXT,
    AMS_STATUSES_TYPES,
    EMPTY_FIELD,
} from "@mds/common/constants/strings";
import { PresetStatusColorType } from "antd/es/_util/colors";
import Loading from "@mds/common/components/common/Loading";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import ProjectContacts from "../projects/ProjectContacts";
import { getProjectLeads } from "@mds/common/redux/selectors/partiesSelectors";
import { getMinistryContactsByRegion } from "@mds/common/redux/selectors/minespaceSelector";
import { fetchAmsFinalAppsByProjectSummary, updateAmsFinalAppMineSpaceEditability } from "@mds/common/redux/slices/amsFinalApplicationSlice";
import { USER_ROLES } from "@mds/common/constants/environment";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import { COLOR } from "@mds/common/constants/styles";
const { Paragraph } = Typography;

const EmaApplicationsTab = () => {
    const dispatch = useAppDispatch();
    const ministryContacts = useAppSelector(getMinistryContactsByRegion);
    const project = useAppSelector(getProject);
    const projectLeads = useAppSelector(getProjectLeads);
    const history = useHistory();
    const [isLoaded, setIsLoaded] = useState(true);
    const [emaData, setEmaData] = useState([]);
    const systemFlag = useAppSelector(getSystemFlag);
    const { isFeatureEnabled } = useFeatureFlag();
    const amsFinalAppEnabled = isFeatureEnabled(Feature.AMS_FINAL_APPLICATION);
    const isCore = systemFlag === SystemFlagEnum.core;
    const authorizations = project?.project_summary?.authorizations;
    const hasMinesActApp = authorizations?.some(auth => auth.project_summary_authorization_type === "MINES_ACT_PERMIT");
    const canEditMajorMineApplications = useAppSelector(userHasRole(USER_ROLES.role_edit_major_mine_applications));
    const [editToggleLoading, setEditToggleLoading] = useState(false);

    const project_lead_contact =
        projectLeads?.filter((lead) => lead.party_guid.includes(project.project_lead_party_guid)) ?? [];

    if (project_lead_contact?.length > 0) {
        project_lead_contact[0].is_project_lead_contact = true;
    } else {
        project_lead_contact.push({ is_project_lead_contact: true, project_contact_guid: "n/a" });
    }

    const contactsAndProjectLead = [...project.contacts, project_lead_contact[0]];

    const fetchAmsData = async () => {
        const amsAuthorizations = authorizations?.filter(
            auth => auth.ams_tracking_number && auth.ams_tracking_number !== "0"
        );
        const amsTrackingNumbers = amsAuthorizations?.map(auth => auth.ams_tracking_number);

        const [statuses, finalApps] = await Promise.all([
            dispatch(fetchProjectSummaryEnvironmentAuthorizationStatuses(amsTrackingNumbers)),
            dispatch(fetchAmsFinalAppsByProjectSummary(project?.project_summary?.project_summary_guid)),
        ]);

        const emaMergedData = amsAuthorizations.map((auth) => {
            const match = statuses.find(
                (status) => status?.ams_tracking_number === auth.ams_tracking_number
            );
            return {
                ...auth,
                status: match?.status,
                ams_authorization_number: match?.ams_authorization_number,
                finalApp: finalApps?.payload?.records.find(
                    (app) => app.project_summary_authorization_guid === auth.project_summary_authorization_guid) || null,
            };
        });

        setEmaData(emaMergedData);
        setIsLoaded(true);
        setEditToggleLoading(false);
    };

    useEffect(() => {
        setIsLoaded(false);
        fetchAmsData();
    }, [authorizations]);

    const updateFinalAppMineSpaceEditability = async (emaRecord, canEdit) => {
        const payload = {
            projectSummaryGuid: emaRecord.project_summary_guid,
            projectSummaryAuthorizationGuid: emaRecord.project_summary_authorization_guid,
            application: { ...emaRecord.finalApp, editable: canEdit }
        };

        setEditToggleLoading(true);
        dispatch(updateAmsFinalAppMineSpaceEditability(payload)).then(() => fetchAmsData());
    };

    const rendereMineSpaceFinalAppEditModal = (record, canEdit) => {
        const iconColor = canEdit ? COLOR.successGreen : COLOR.yellow;
        return Modal.confirm({
            title: <b>Are you sure you want to change the file editability status for this application?</b>,
            icon: <CheckCircleOutlined style={{ color: iconColor, fontSize: "26px" }} />,
            content: (<div>
                <Paragraph>
                    Changing this setting will:
                    <ul style={{ listStyleType: "disc" }}>
                        {!canEdit
                            ? <li>
                                <b>Disable</b> file editting: Files will be locked and cannot be changed unless re-enabled.
                            </li>
                            : <li>
                                <b>Enable</b> file editting: Users will be able to upload, replace, or modify files.
                            </li>
                        }
                    </ul>

                    This action affects all files associated with this final application project.
                </Paragraph>
            </div>),
            width: 550,
            okText: "Confirm Change",
            cancelText: "Cancel",
            onOk: () => updateFinalAppMineSpaceEditability(record, canEdit),
        })
    };

    return (
        <>
            {isLoaded ? (
                <div data-testid="ema-applications-content">
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
                                dataSource={emaData}
                                renderItem={(item) => {
                                    const finalApp = item.finalApp;
                                    const editOptionText = finalApp?.editable ? "Disable" : "Enable";
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
                                                    status={(AMS_STATUSES_TYPES[item.status] ?? "default") as PresetStatusColorType}
                                                    text={item.status}
                                                />
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Authorization Number">
                                                {item.project_summary_permit_type[0] === "NEW" ? EMPTY_FIELD : item.ams_authorization_number}
                                            </Descriptions.Item>
                                            {(isCore && canEditMajorMineApplications && finalApp)
                                                ? <Descriptions.Item label="" style={{ float: "right", marginLeft: "auto" }}>
                                                    <Tooltip title={`${editOptionText} File Editing`}>
                                                        <Button
                                                            className="ant-btn-ghost"
                                                            onClick={() => rendereMineSpaceFinalAppEditModal(item, !finalApp.editable)}
                                                            disabled={editToggleLoading}>
                                                            <FormOutlined /> {editOptionText} Edits
                                                        </Button>
                                                    </Tooltip>
                                                </Descriptions.Item>
                                                : null}
                                        </Descriptions>
                                        {
                                            amsFinalAppEnabled && (
                                                <Button onClick={() => history.push(
                                                    GLOBAL_ROUTES?.AMS_FINAL_APPLICATION.dynamicRoute(
                                                        project.project_guid,
                                                        project.project_summary.project_summary_guid,
                                                        item.project_summary_authorization_guid
                                                    )
                                                )}
                                                    type="primary"
                                                    disabled={editToggleLoading}
                                                >
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
                                <Col span={24}>
                                    <ProjectContacts contacts={contactsAndProjectLead} title="Project Contacts" />
                                </Col>
                                {!isCore && <Col span={24}>
                                    <ProjectContacts contacts={ministryContacts} title="Ministry Contacts" />
                                </Col>}
                            </Row>
                        </Col>
                        }
                    </Row >
                </div>
            ) : (
                <Loading />
            )}
        </>
    )
}

export default EmaApplicationsTab;