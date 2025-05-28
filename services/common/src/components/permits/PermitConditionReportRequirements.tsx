import React, { FC } from "react";
import { Collapse, Typography } from "antd";
import {
    IMineReportPermitRequirement
} from "@mds/common/interfaces/permits";
import ReportPermitRequirementForm from "@mds/common/components/permits/ReportPermitRequirementForm";

interface PermitConditionReportRequirementsProps {
    requirements: IMineReportPermitRequirement[];
    refreshData?: () => Promise<void>;
    canEditPermitConditions?: boolean;
}

const PermitConditionReportRequirements: FC<PermitConditionReportRequirementsProps> = ({
    requirements,
    refreshData,
    canEditPermitConditions = false
}) => {

    refreshData = refreshData || (() => Promise.resolve());

    return (
        <Collapse expandIconPosition="end">
            {requirements.map((req: IMineReportPermitRequirement, index) => {
                return (
                    <Collapse.Panel
                        key={req.mine_report_permit_requirement_id}
                        header={
                            <Typography.Text strong>
                                Report #{index + 1}
                                {req.report_name
                                    ? ` - ${req.report_name}`
                                    : ""}
                            </Typography.Text>
                        }
                        className="report-collapse"
                    >
                        <ReportPermitRequirementForm
                            mineReportPermitRequirement={req}
                            canEditPermitConditions={canEditPermitConditions}
                            refreshData={refreshData}
                        />
                    </Collapse.Panel>
                )
            }
            )}
        </Collapse>
    );
};

export default PermitConditionReportRequirements;