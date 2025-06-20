import React, { useEffect, useState } from "react";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { fetchAmsFinalApp, getAmsFinalAppByAuthGuid, getAmsFinalAppIsLoaded } from "@mds/common/redux/slices/amsFinalApplicationSlice";
import { useParams } from "react-router-dom";
import SteppedForm from "../../forms/SteppedForm";
import EnvBasicInformationTab from "./EnvBasicInformationTab";
import EnvDocumentsTab from "./EnvDocumentsTab";
import EnvDeclarationTab from "./EnvDeclarationTab";
import Step from "../../forms/Step";
import { FORM } from "@mds/common/constants/forms";

const EnvApplicationPage = () => {
    const { projectGuid, projectSummaryGuid, projectSummaryAuthorizationGuid, tab } = useParams<{
        projectGuid: string, projectSummaryGuid: string, projectSummaryAuthorizationGuid: string, tab: string
    }>();

    const dispatch = useAppDispatch();
    const amsFinalApp = useAppSelector(getAmsFinalAppByAuthGuid(projectSummaryAuthorizationGuid));
    const amsFinalAppLoaded = useAppSelector(getAmsFinalAppIsLoaded(projectSummaryAuthorizationGuid));
    const hasFinalApp = amsFinalAppLoaded ? Boolean(amsFinalApp) : undefined;
    const [isEditMode, setIsEditMode] = useState(true);

    console.log('amsFinalApp', amsFinalApp);
    console.log('amsFinalAppLoaded', amsFinalAppLoaded);
    console.log('hasFinalApp', hasFinalApp);

    useEffect(() => {
        dispatch(fetchAmsFinalApp({ projectSummaryGuid, projectSummaryAuthorizationGuid }));
    }, []);

    const handleSaveData = (values, newActiveTab) => {
        console.log('handle save data', values, newActiveTab);
        return Promise.resolve();
    }

    const allTabs = {
        "basic-information": <EnvBasicInformationTab />,
        "documents": <EnvDocumentsTab />,
        "declaration": <EnvDeclarationTab />
    };

    return (
        
        <SteppedForm
            name={FORM.ADD_EDIT_AMS_FINAL_APPLICATION}
            initialValues={amsFinalApp}
            isEditMode={isEditMode}
            handleSaveData={handleSaveData}
            handleTabChange={() => { }}
            activeTab={tab}
        >
            {Object.entries(allTabs).map(([key, component]) => {
                return <Step key={key}>{component}</Step>
            })}
        </SteppedForm>
    );
};

export default EnvApplicationPage;