import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { createAmsFinalApp, fetchAmsFinalApp, getAmsFinalAppByAuthGuid, getAmsFinalAppIsLoaded, updateAmsFinalApp } from "@mds/common/redux/slices/amsFinalApplicationSlice";
import { useHistory, useParams } from "react-router-dom";
import SteppedForm from "../../forms/SteppedForm";
import EnvBasicInformationTab from "./EnvBasicInformationTab";
import EnvDocumentsTab from "./EnvDocumentsTab";
import EnvDeclarationTab from "./EnvDeclarationTab";
import Step from "../../forms/Step";
import { FORM } from "@mds/common/constants/forms";
import CommonPageHeader from "../../common/CommonPageHeader";
import { getProjectSummary } from "@mds/common/redux/selectors/projectSelectors";
import { fetchProjectSummaryById } from "@mds/common/redux/actionCreators/projectActionCreator";
import Loading from "../../common/Loading";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES_TEXT } from "@mds/common/constants/strings";
import { Tag } from "antd";
import { isProponent, userHasRole, getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";
import { SystemFlagEnum } from "@mds/common/constants/enums";

const EnvApplicationPage = () => {
    const { projectGuid, projectSummaryGuid, projectSummaryAuthorizationGuid, tab } = useParams<{
        projectGuid: string, projectSummaryGuid: string, projectSummaryAuthorizationGuid: string, tab: string
    }>();

    const history = useHistory();
    const dispatch = useAppDispatch();
    const amsFinalApp = useAppSelector(getAmsFinalAppByAuthGuid(projectSummaryAuthorizationGuid));
    const initialValues = amsFinalApp?.submitted_timestamp
        ? { ...amsFinalApp, is_submitting: true }
        : amsFinalApp
    const amsFinalAppLoaded = useAppSelector(getAmsFinalAppIsLoaded(projectSummaryAuthorizationGuid));

    const projectSummary = useAppSelector(getProjectSummary);
    const projectSummaryLoaded = projectSummary?.project_summary_guid === projectSummaryGuid;

    const mine = useAppSelector(getMineById(projectSummary?.mine_guid));
    const auth = projectSummary?.authorizations?.find((a) => a.project_summary_authorization_guid === projectSummaryAuthorizationGuid);
    const authType = AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES_TEXT[auth?.project_summary_authorization_type] ?? ""
    const trackingNumber = auth?.ams_tracking_number;
    const canEditMajorMineApplications = useAppSelector(userHasRole(USER_ROLES.role_edit_major_mine_applications));
    const isUserProponent = useAppSelector(isProponent);
    const [isEditMode, setIsEditMode] = useState((canEditMajorMineApplications || isUserProponent));
    const systemFlag = useAppSelector(getSystemFlag);
    const isCore = systemFlag === SystemFlagEnum.core;

    const loaded = amsFinalAppLoaded && projectSummaryLoaded;

    useEffect(() => {
        if (!projectSummaryLoaded) {
            dispatch(fetchProjectSummaryById(projectGuid, projectSummaryGuid))
        }
        dispatch(fetchAmsFinalApp({ projectSummaryGuid, projectSummaryAuthorizationGuid }));
    }, []);

    useEffect(() => {
        if (amsFinalApp && !isCore && !amsFinalApp.editable) {
            setIsEditMode(false);
        }
    }, [amsFinalApp]);

    const handleSaveData = async (values, _newActiveTab) => {
        const payload = {
            projectSummaryGuid,
            projectSummaryAuthorizationGuid,
            application: values
        };

        if (values.ams_final_application_guid) {
            const projectTitle = projectSummary?.project_summary_title;
            return await dispatch(updateAmsFinalApp(payload)).then((resp) => {
                if (!_newActiveTab) {
                    history.push({
                        pathname: GLOBAL_ROUTES?.ENVIRONMENTAL_MANAGEMENT_ACT_FINAL_APPLICATION_SUCCESS.dynamicRoute(
                            projectGuid),
                        state: { projectTitle },
                    });
                }
            });
        } else {
            return await dispatch(createAmsFinalApp(payload)).then((resp) => { });
        }
    }

    const handleTabChange = (newTab: string) => {
        if (!newTab) {
            return;
        }

        return history.push(
            GLOBAL_ROUTES?.AMS_FINAL_APPLICATION.dynamicRoute(
                projectGuid, projectSummaryGuid, projectSummaryAuthorizationGuid, newTab
            )
        );
    };

    const allTabs = {
        "basic-information": <EnvBasicInformationTab trackingNumber={trackingNumber} />,
        "documents": <EnvDocumentsTab />,
        "declaration": <EnvDeclarationTab />
    };

    const entityLabel = trackingNumber
    return (
        loaded ?
            <div className="fixed-tabs-container">
                <CommonPageHeader
                    entityLabel={entityLabel}
                    entityType="ENV Application"
                    mineGuid={projectSummary?.mine_guid}
                    extraElement={<Tag className="table-tag table-tag--primary">{authType}</Tag>}
                    current_permittee={""}
                    breadCrumbs={[
                        {
                            route: GLOBAL_ROUTES?.MAJOR_PROJECTS.dynamicRoute(mine?.mine_guid),
                            text: `${mine?.mine_name} Major Projects`,
                        },
                        {
                            route: GLOBAL_ROUTES?.EDIT_PROJECT.dynamicRoute(projectGuid),
                            text: projectSummary?.project_summary_title
                        }
                    ]}
                    pageContent={<SteppedForm
                        name={FORM.ADD_EDIT_AMS_FINAL_APPLICATION}
                        initialValues={initialValues}
                        isEditMode={isEditMode}
                        handleSaveData={handleSaveData}
                        forceRedux={true}
                        handleTabChange={handleTabChange}
                        activeTab={tab}
                        confirmOnSubmit={true}
                        confirmSubmissionText={"Are you sure you want to submit your application package? Once submitted, the Ministry will be notified and your application will enter the formal screening process."}
                    >
                        {Object.entries(allTabs).map(([key, component]) => {
                            return <Step key={key}>{component}</Step>
                        })}
                    </SteppedForm>}
                />
            </div> : <Loading />
    );
};

export default EnvApplicationPage;