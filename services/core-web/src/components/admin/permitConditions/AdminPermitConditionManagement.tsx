import React, { FC } from "react";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import AdminPermitConditionManagementOld from "./AdminPermitConditionManagementOld";
import { useLocation, useParams } from "react-router-dom";
import PermitConditionsNavigation from "./PermitConditionsNavigation";
import StandardPermitConditions from "@/components/Forms/permits/conditions/StandardPermitConditions";

const PERMIT_CONDITION_TABS = ['sand-and-gravel', 'exploration', 'quarry', 'placer'];

const AdminPermitConditionManagement: FC = () => {
    const { isFeatureEnabled } = useFeatureFlag();
    const isNewEditorEnabled = isFeatureEnabled(Feature.STANDARD_PERMIT_CONDITIONS_EDITOR);
    const location = useLocation();
    const { type } = useParams<{ type: string }>();
    const activeTab = type ?? PERMIT_CONDITION_TABS[0];

    if (!isNewEditorEnabled) {
        return <AdminPermitConditionManagementOld location={location} />;
    }

    return (
        <div>
            <div className="landing-page__header">
                <h1>Permit Condition Management</h1>
            </div>
            <PermitConditionsNavigation
                activeButton="permit-conditions"
                openSubMenuKey={[activeTab]}
            />
            <div className="tab__content">
                <StandardPermitConditions type={type} />
            </div>
        </div>
    );

};

export default AuthorizationGuard(Permission.EDIT_TEMPLATE_PERMIT_CONDITIONS)(AdminPermitConditionManagement);