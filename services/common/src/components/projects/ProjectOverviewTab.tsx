import React, { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { useHistory } from "react-router-dom";
import { Row, Col, Typography, Descriptions, Button, Collapse } from "antd";
import {
    getProjectSummaryStatusCodesHash,
    getProjectSummaryPermitTypesHash,
    getProjectSummaryAuthorizationTypesHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getProjectLeads } from "@mds/common/redux/selectors/partiesSelectors";
import * as Strings from "@mds/common/constants/strings";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { Feature } from "@mds/common/utils/featureFlag";
import ProjectLinks from "@mds/common/components/projectSummary/ProjectLinks";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES } from "@mds/common/constants/enums";
import CoreTable from "../common/CoreTable";
import { renderActionsColumn, renderCategoryColumn, renderDateColumn, renderStatusColumn, renderTextColumn } from "../common/CoreTableCommonColumns";
import { fetchAmsFinalAppsByProjectSummary, getAmsFinalAppsByProjectSummary } from "@mds/common/redux/slices/amsFinalApplicationSlice";
import { AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES_TEXT } from "@mds/common/constants/strings";
import ProjectContacts from "./ProjectContacts";
import { fetchProjectSummaryEnvironmentAuthorizationStatuses } from "@mds/common/redux/actionCreators/projectActionCreator";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { areDocumentFieldsDisabled } from "./projectUtils";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import { getMinistryContactsByRegion } from "@mds/common/redux/slices/minespaceSlice";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { formatDate } from "@mds/common/redux/utils/helpers";
import { IProjectSummaryAuthorization } from "@mds/common/interfaces";

const SectionHeader = ({ children, titleText, isLast = false }) => {
    return <Collapse
        defaultActiveKey="1"
        style={isLast ? {} : { marginBottom: 16 }}
        className="primary-title-collapse"
    >
        <Collapse.Panel
            header={
                <Typography.Title level={2} style={{ marginBottom: 0 }} className="color-white">
                    {titleText}
                </Typography.Title>
            }
            key="1"
        >
            {children}
        </Collapse.Panel>
    </Collapse>
}

const ProjectOverviewTab: FC = () => {
    const history = useHistory();
    const dispatch = useAppDispatch();
    const isCore = useAppSelector(getIsCore);
    const system = useAppSelector(getSystemFlag);
    const permits = useAppSelector(getPermits);
    const project = useAppSelector(getProject);
    const permitTypesHash = useAppSelector(getProjectSummaryPermitTypesHash);
    const projectSummaryStatusCodesHash = useAppSelector(getProjectSummaryStatusCodesHash);
    const projectSummaryAuthTypeHash = useAppSelector(getProjectSummaryAuthorizationTypesHash);
    const projectLeads = useAppSelector(getProjectLeads);
    const ministryContacts = useAppSelector(getMinistryContactsByRegion);
    const amsFinalApps = useAppSelector(getAmsFinalAppsByProjectSummary(project?.project_summary?.project_summary_guid));
    const { isFeatureEnabled } = useFeatureFlag();
    const shouldDisplayLinkedProjects = isFeatureEnabled(Feature.MAJOR_PROJECT_LINK_PROJECTS);
    const amsFinalAppEnabled = isFeatureEnabled(Feature.AMS_FINAL_APPLICATION);

    const {
        authorizations = [],
        project_summary_description,
        expected_draft_irt_submission_date,
        expected_permit_application_date,
        expected_permit_receipt_date,
        expected_project_start_date,
        project_guid,
        project_summary_guid,
        submission_date
    } = project.project_summary;

    const isProjectSummarySubmitted = Boolean(submission_date);
    const amsAuthTypes = Object.keys(AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES)
    const maAuthorizations = authorizations.filter((a) => !amsAuthTypes.includes(a.project_summary_authorization_type));
    const amsAuthorizations = authorizations.filter((a) => amsAuthTypes.includes(a.project_summary_authorization_type));
    const hasMinesActAuth = maAuthorizations.length > 0;
    const hasAmsAuth = amsAuthorizations.length > 0;
    const [amsStatusData, setAmsStatusData] = useState([]);

    const getStatusText = (status_code: string) => {
        const statusCode = !isCore && status_code === "ASG" ? "SUB" : status_code;
        return projectSummaryStatusCodesHash[statusCode];
    };

    const hasIRT = Boolean(project.information_requirements_table?.irt_guid);
    const irtDocsDisabled = areDocumentFieldsDisabled(system, project.information_requirements_table.status_code);

    const hasMaFinalApp = Boolean(project.major_mine_application?.major_mine_application_guid);
    const maAppDocsDisabled = areDocumentFieldsDisabled(system, project.major_mine_application.status_code);

    const getButtonProps = (recordExists: boolean, editLocked: boolean) => {
        let buttonProps = { text: "Start", disabled: false };
        if (!isProjectSummarySubmitted || (isCore && !recordExists)) {
            buttonProps.disabled = true;
        }
        if (recordExists) {
            buttonProps.text = editLocked ? "View" : "Resume";
        }
        return buttonProps;
    };

    const getPermitNo = (permitGuid: string) => {
        const permit = permits.find((p) => p.permit_guid === permitGuid);
        // for some authorizations (mines act) it's stored as the guid, and for others (ex: forestry) the permitNo (free text entry)
        return permit?.permit_no ?? permitGuid;
    };

    const projectSummaryStatus = { status: getStatusText(project.project_summary.status_code) };
    const maAuthTableData = maAuthorizations.map((a: IProjectSummaryAuthorization) => {
        const permits = a.existing_permits_authorizations?.length > 0
            ? a.existing_permits_authorizations?.map((p) => <div>{getPermitNo(p)}</div>)
            : Strings.NOT_APPLICABLE;

        return {
            key: a.project_summary_authorization_guid,
            permits,
            auth_type: a.project_summary_authorization_type,
            type: <>{a.project_summary_permit_type.map((t) => <div>{permitTypesHash[t]}</div>)}</>,
            ...projectSummaryStatus
        }
    });

    const projectDescriptionTableData = [{
        name: "Project Description",
        date: project.project_summary.update_timestamp,
        ...projectSummaryStatus
    }];
    const projDescButtonText = project.project_summary?.submission_date ? "View" : "Resume";

    const projectSummaryTableData = hasMinesActAuth ? maAuthTableData : [projectSummaryStatus];

    const irtButtonProps = getButtonProps(hasIRT, irtDocsDisabled);
    const irtTableData = {
        key: "irt-table-item",
        ...project.information_requirements_table,
        irt_type: hasAmsAuth ? "Joint Application" : "Mines Act Permit",
        status: getStatusText(project.information_requirements_table?.status_code)
    }
    const maAppButtonProps = getButtonProps(hasMaFinalApp, maAppDocsDisabled);
    const maAppTableData = hasMinesActAuth ? {
        key: "mma-table-item",
        ...project.major_mine_application,
        type: irtTableData.irt_type,
        status: getStatusText(project.major_mine_application?.status_code)
    } : {};

    const amsAuthTableData = amsAuthorizations.map((auth) => {
        const app = amsFinalApps.find((a) => a.project_summary_authorization_guid === auth.project_summary_authorization_guid);
        const statusData = amsStatusData.find((s) => s.ams_tracking_number === auth?.ams_tracking_number);

        let status = {
            "500": "Failed",
            "400": "AMS Rejected",
            "200": statusData?.status ?? Strings.NOT_APPLICABLE
        }[auth?.ams_status_code ?? "200"];
        return {
            ...app,
            ...auth,
            status,
            auth_no: auth?.existing_permits_authorizations?.[0] ?? Strings.NOT_APPLICABLE,
        }
    });

    const project_lead_contact =
        projectLeads?.filter((lead) => lead.party_guid.includes(project.project_lead_party_guid)) ?? [];

    if (project_lead_contact?.length > 0) {
        project_lead_contact[0].is_project_lead_contact = true;
    } else {
        project_lead_contact.push({ is_project_lead_contact: true, project_contact_guid: "n/a" });
    }

    const contactsAndProjectLead = [...project.contacts, project_lead_contact[0]];

    useEffect(() => {
        if (hasAmsAuth && amsFinalApps?.length !== amsAuthorizations?.length) {
            dispatch(fetchAmsFinalAppsByProjectSummary(project?.project_summary?.project_summary_guid));
        }
        if (amsAuthorizations.length !== amsStatusData.length) {
            const amsTrackingNumbers = amsAuthorizations?.map((auth) => auth.ams_tracking_number);

            dispatch(fetchProjectSummaryEnvironmentAuthorizationStatuses(amsTrackingNumbers)).then((response) => {
                if (response) {
                    setAmsStatusData(response);
                }
            });
        }
    }, [hasAmsAuth, amsAuthorizations.length]);

    useEffect(() => {
        const permitsFetched = permits.length > 0 && permits[0].mine_guid === project.mine_guid;
        if (hasMinesActAuth && !permitsFetched) {
            dispatch(fetchPermits(project.mine_guid));
        }
    }, [hasMinesActAuth]);

    const handleNavigateProjectSummary = () => {
        const url = isProjectSummarySubmitted
            ? GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(project_guid, "project-description")
            : GLOBAL_ROUTES?.EDIT_PROJECT_SUMMARY.dynamicRoute(project_guid, project_summary_guid, "basic-information", isCore);

        history.push(url);
    };

    const handleNavigateIrt = () => {
        history.push(
            GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(project_guid, "information-requirements-table")
        );
    };

    const handleNavigateMaApplication = () => {
        history.push(
            GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(project_guid, "major-mine-application")
        );
    };

    const handleNavigateAmsApp = (app) => {
        history.push(
            GLOBAL_ROUTES?.AMS_FINAL_APPLICATION.dynamicRoute(
                project.project_guid,
                project.project_summary.project_summary_guid,
                app.project_summary_authorization_guid
            )
        );
    };

    const amsAppActions = [{
        key: "final-app",
        label: "Manage Final Application",
        clickFunction: (_e, record) => handleNavigateAmsApp(record)
    }];

    const amsAppActionsFilter = (record, allActions) => {
        if (!record.ams_tracking_number) {
            return [];
        }
        return allActions;
    };

    return <Row
        gutter={[0, 16]}
    >
        <Col
            lg={{ span: 14 }} xl={{ span: 16 }}
        >
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Typography.Title level={2}>Overview</Typography.Title>
                    <Typography.Paragraph strong>Project description</Typography.Paragraph>
                    <Typography.Paragraph>{project_summary_description}</Typography.Paragraph>
                    <Typography.Paragraph strong>Key dates</Typography.Paragraph>
                    <Row>
                        <Col lg={12}>
                            <Descriptions column={2} layout="vertical">
                                <Descriptions.Item label="Estimated IRT Submission" span={12} className="vertical-description">
                                    {formatDate(expected_draft_irt_submission_date) ?? Strings.EMPTY_FIELD}
                                </Descriptions.Item>
                                <Descriptions.Item label="Desired date to receive permit/amendment(s)" span={12} className="vertical-description">
                                    {formatDate(expected_permit_receipt_date) ?? Strings.EMPTY_FIELD}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col lg={12}>
                            <Descriptions column={2} layout="vertical">
                                <Descriptions.Item label="Estimated Permit Application Submission" span={12} className="vertical-description">
                                    {formatDate(expected_permit_application_date) ?? Strings.EMPTY_FIELD}
                                </Descriptions.Item>
                                <Descriptions.Item label="Anticipated work start" span={12} className="vertical-description">
                                    {formatDate(expected_project_start_date) ?? Strings.EMPTY_FIELD}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <SectionHeader titleText="1. Project Description">
                        <Col span={24}>
                            <CoreTable
                                columns={[
                                    renderTextColumn("name", "Stage"),
                                    renderDateColumn("date", "Date"),
                                    renderStatusColumn(Strings.PROJECT_STATUS_SEVERITY),
                                    {
                                        key: "button-col",
                                        className: "actions-column",
                                        fixed: "right",
                                        render: () => {
                                            return <Button
                                                data-cy="project-description-view-link"
                                                onClick={handleNavigateProjectSummary}
                                            >{projDescButtonText}</Button>
                                        }
                                    },
                                ]}
                                dataSource={projectDescriptionTableData}
                            />{
                                <div className="gov-grey-border-box">
                                    <Typography.Title level={4}>Authorizations</Typography.Title>
                                    {hasMinesActAuth && <><Typography.Title level={5}>Mines Act (MA) and Joint Application Authorization</Typography.Title>
                                        <CoreTable
                                            columns={[
                                                renderCategoryColumn('auth_type', 'Authorization Type', projectSummaryAuthTypeHash),
                                                renderTextColumn('type', 'Permit Type'),
                                                renderTextColumn('permits', 'Permit'),
                                            ]}
                                            dataSource={projectSummaryTableData}
                                        /></>}
                                    {hasAmsAuth && <><Typography.Title level={5}>Environmental Management Act (EMA) Authorization</Typography.Title>
                                        <Typography.Paragraph>
                                            An Environmental Protection Officer will contact you once your application is reviewed and accepted. In the meantime, to learn about the ministry's structured application process and timelines to get a waste discharge authorization, please visit
                                            {" "}<a href="https://www2.gov.bc.ca/gov/content/environment/waste-management/waste-discharge-authorization/process">The waste discharge authorization process.</a>
                                        </Typography.Paragraph>
                                        <CoreTable
                                            columns={[
                                                renderCategoryColumn("project_summary_authorization_type", "Type", AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES_TEXT),
                                                renderTextColumn("auth_no", "Auth #"),
                                                renderTextColumn("ams_tracking_number", "Tracking #"),
                                                renderDateColumn("ams_submission_timestamp", "Date"),
                                                renderStatusColumn(Strings.AMS_STATUSES_TYPES, "Status"),
                                            ]}
                                            dataSource={amsAuthTableData}
                                        /></>}
                                </div>
                            }
                        </Col>
                    </SectionHeader>

                    {hasMinesActAuth &&
                        <SectionHeader titleText="2. Information Requirements Table (IRT)">
                            <Col span={24}>
                                <Typography.Title level={5}>Mines Act (MA) and Joint Application</Typography.Title>
                                <CoreTable
                                    columns={[
                                        renderTextColumn("irt_type", "Final IRT"),
                                        renderDateColumn("date", "Date"),
                                        renderStatusColumn(Strings.PROJECT_STATUS_SEVERITY, "Status"),
                                        {
                                            key: "button-col",
                                            className: "actions-column",
                                            fixed: "right",
                                            render: () => {
                                                return <Button
                                                    disabled={irtButtonProps.disabled}
                                                    data-cy="final-irt-view-link"
                                                    onClick={handleNavigateIrt}
                                                >{irtButtonProps.text}</Button>
                                            }
                                        },
                                    ]}
                                    dataSource={[irtTableData]}
                                />
                            </Col>
                        </SectionHeader>}
                    <SectionHeader titleText={`${hasMinesActAuth ? "3" : "2"}. Application and Final Package`} isLast>
                        <Col span={24}>
                            {hasMinesActAuth &&
                                <> <Typography.Title level={5}>Mines Act and Joint Application</Typography.Title>
                                    <CoreTable
                                        columns={[
                                            renderTextColumn("type", "Application"),
                                            renderDateColumn("update_timestamp", "Date"),
                                            renderStatusColumn(Strings.PROJECT_STATUS_SEVERITY),
                                            {
                                                key: "button-col",
                                                className: "actions-column",
                                                fixed: "right",
                                                render: () => {
                                                    return <Button
                                                        data-cy="final-application-view-link"
                                                        disabled={maAppButtonProps.disabled}
                                                        onClick={handleNavigateMaApplication}
                                                    >{maAppButtonProps.text}</Button>
                                                }
                                            },
                                        ]}
                                        dataSource={[maAppTableData]}
                                    /></>}
                            {hasAmsAuth && amsFinalAppEnabled && <><Typography.Title level={5}>Environmental Management Act</Typography.Title>
                                <CoreTable
                                    columns={[
                                        renderCategoryColumn("project_summary_authorization_type", "Final Application", AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES_TEXT),
                                        renderTextColumn("auth_no", "Authorization"),
                                        renderTextColumn("ams_tracking_number", "Tracking #"),
                                        renderStatusColumn(Strings.AMS_STATUSES_TYPES, "Status"),
                                        renderActionsColumn({ actions: amsAppActions, recordActionsFilter: amsAppActionsFilter })
                                    ]}
                                    dataSource={amsAuthTableData}
                                /></>}
                        </Col>
                    </SectionHeader>
                </Col>

                {shouldDisplayLinkedProjects && (
                    <Col span={24}>
                        <ProjectLinks
                            tableOnly
                            fieldsDisabled={true}
                            viewProject={(p) =>
                                GLOBAL_ROUTES?.EDIT_PROJECT_SUMMARY.dynamicRoute(p.project_guid, p.project_summary_guid)
                            }
                        />
                    </Col>
                )}
            </Row>
        </Col>
        <Col
            lg={{ span: 9, offset: 1 }} xl={{ span: 7, offset: 1 }}
        >
            <Row gutter={[0, 16]}>
                <Col span={24}>
                    <ProjectContacts contacts={contactsAndProjectLead} title="Project Contacts" />
                </Col>
                {!isCore && <Col span={24}>
                    <ProjectContacts contacts={ministryContacts} title="Ministry Contacts" />
                </Col>}
            </Row>
        </Col>
    </Row>;
}

export default ProjectOverviewTab;