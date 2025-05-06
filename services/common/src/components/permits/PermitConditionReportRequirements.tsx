import React, { FC } from "react";
import { Collapse, Typography } from "antd";
import {
    IPermitCondition,
} from "@mds/common/interfaces/permits";
import ReportPermitRequirementForm from "@mds/common/components/permits/ReportPermitRequirementForm";
import { usePermitConditions } from "@mds/common/components/permits/PermitConditionsContext";

interface PermitConditionReportRequirementsProps {
    conditionsWithRequirements: IPermitCondition[];
    refreshData?: () => Promise<void>;
    canEditPermitConditions?: boolean;
}

const PermitConditionReportRequirements: FC<PermitConditionReportRequirementsProps> = ({
    conditionsWithRequirements,
    refreshData,
    canEditPermitConditions = false
}) => {
    const { mineGuid, permitGuid, currentAmendment } = usePermitConditions();

    refreshData = refreshData || (() => Promise.resolve());

    return (
        <Collapse expandIconPosition="end">
            {conditionsWithRequirements.map((cond: IPermitCondition, index) => {
                return (
                    <Collapse.Panel
                        key={cond.permit_condition_id}
                        header={
                            <Typography.Text strong>
                                Report #{index + 1}
                                {cond.mineReportPermitRequirement?.report_name
                                    ? ` - ${cond.mineReportPermitRequirement.report_name}`
                                    : ""}
                            </Typography.Text>
                        }
                        className="report-collapse"
                    >
                        <ReportPermitRequirementForm
                            condition={cond}
                            mineReportPermitRequirement={cond.mineReportPermitRequirement}
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