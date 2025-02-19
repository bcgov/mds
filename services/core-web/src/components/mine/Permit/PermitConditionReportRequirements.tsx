import React, { FC } from "react";
import { Collapse, Typography } from "antd";
import {
    IPermitCondition,
} from "@mds/common/interfaces/permits";
import ReportPermitRequirementForm from "@/components/Forms/reports/ReportPermitRequirementForm";
import { usePermitConditions } from "./PermitConditionsContext";

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
            {conditionsWithRequirements.map((cond, index) => {
                let reportName = null;
                if (cond.mineReportPermitRequirement?.report_name) {
                    reportName = cond.mineReportPermitRequirement?.report_name;
                } else if (cond["report_name"]) {
                    reportName = cond["report_name"];
                }

                return (
                    <Collapse.Panel
                        key={cond.permit_condition_id}
                        header={
                            <Typography.Text strong>
                                Report #{index + 1}
                                {reportName
                                    ? ` - ${reportName}`
                                    : ""}
                            </Typography.Text>
                        }
                        className="report-collapse"
                    >
                        <ReportPermitRequirementForm
                            modalView={false}
                            condition={cond}
                            permitGuid={permitGuid}
                            mineReportPermitRequirement={cond.mineReportPermitRequirement}
                            canEditPermitConditions={canEditPermitConditions}
                            refreshData={refreshData}
                            currentAmendment={currentAmendment}
                            mineGuid={mineGuid}
                        />
                    </Collapse.Panel>
                )
            }
            )}
        </Collapse>
    );
};

export default PermitConditionReportRequirements;