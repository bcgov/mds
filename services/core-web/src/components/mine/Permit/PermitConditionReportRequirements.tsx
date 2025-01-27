import React, { FC } from "react";
import { Collapse, Typography } from "antd";
import {
    IPermitCondition,
} from "@mds/common/interfaces/permits";
import ReportPermitRequirementForm from "@/components/Forms/reports/ReportPermitRequirementForm";

interface PermitConditionReportRequirementsProps {
    conditionsWithRequirements: IPermitCondition[];
    handleEditReportRequirement: (values: any) => void;
    permitGuid: string;
}

const PermitConditionReportRequirements: FC<PermitConditionReportRequirementsProps> = ({
    conditionsWithRequirements,
    handleEditReportRequirement,
    permitGuid,
}) => {
    return (
        <Collapse expandIconPosition="end">
            {conditionsWithRequirements.map((cond: IPermitCondition, index) => (
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
                        modalView={false}
                        onSubmit={handleEditReportRequirement}
                        condition={cond}
                        permitGuid={permitGuid}
                        mineReportPermitRequirement={cond.mineReportPermitRequirement}
                    />
                </Collapse.Panel>
            ))}
        </Collapse>
    );
};

export default PermitConditionReportRequirements;