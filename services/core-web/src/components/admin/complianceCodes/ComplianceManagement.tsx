import React, { FC } from "react";
import PermitConditionsNavigation from "../permitConditions/PermitConditionsNavigation";
import { useParams } from "react-router-dom";
import ComplianceCodeManagement from "./ComplianceCodeManagement";
import ComplianceReportManagement from "./ComplianceReportManagement";

export const COMPLIANCE_TABS = ["codes", "reports"];

const ComplianceManagement: FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const activeTab = tab ?? COMPLIANCE_TABS[0];

  const tabContent = {
    [COMPLIANCE_TABS[0]]: {
      title: "Health, Safety and Reclamation Code",
      content: <ComplianceCodeManagement />
    },
    [COMPLIANCE_TABS[1]]: {
      title: "Health, Safety and Reclamation Code Report",
      content: <ComplianceReportManagement />
    }
  };
  const activeContent = tabContent[activeTab];

  return (
    <div>
      <div className="landing-page__header">
        <h1>Permit Condition Management</h1>
      </div>
      <PermitConditionsNavigation
        activeButton="hsrc-management"
        openSubMenuKey={[activeTab]}
      />
      <div className="tab__content">
        <h2>{activeContent.title}</h2>
        {activeContent.content}
      </div>
    </div>
  )
};

export default ComplianceManagement;