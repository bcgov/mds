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
import { isProponent, userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";

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
    const [isEditMode] = useState(canEditMajorMineApplications || isUserProponent);

    const loaded = amsFinalAppLoaded && projectSummaryLoaded;

    useEffect(() => {
        if (!projectSummaryLoaded) {
            dispatch(fetchProjectSummaryById(projectGuid, projectSummaryGuid))
        }
        dispatch(fetchAmsFinalApp({ projectSummaryGuid, projectSummaryAuthorizationGuid }));
    }, []);

    const handleSaveData = (values, _newActiveTab) => {
        const payload = {
            projectSummaryGuid,
            projectSummaryAuthorizationGuid,
            application: values
        };
        if (values.ams_final_application_guid) {
            return dispatch(updateAmsFinalApp(payload)).then((resp) => { });
        } else {
            return dispatch(createAmsFinalApp(payload)).then((resp) => { });
        }
    }

    const handleTabChange = (newTab: string) => {
        return history.push(
            GLOBAL_ROUTES?.AMS_FINAL_APPLICATION.dynamicRoute(
                projectGuid, projectSummaryGuid, projectSummaryAuthorizationGuid, newTab
            )
        );
    };

    const allTabs = {
        "basic-information": <EnvBasicInformationTab />,
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
                        handleTabChange={handleTabChange}
                        activeTab={tab}
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