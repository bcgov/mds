import React, { FC } from "react";
import { Col, Row, Typography } from "antd";
import { IPermitCondition } from "@mds/common/interfaces";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import ConditionDiffViewer from "@mds/common/components/permits/ConditionDiffViewer";
import PermitConditionReportRequirements from "@mds/common/components/permits/PermitConditionReportRequirements";
import { getReportRequirementsByCondition } from "@mds/common/redux/selectors/permitSelectors";
import { useSelector } from "react-redux";
import { usePermitConditions } from "./PermitConditionsContext";

export interface ComparePermitConditionHistoryModalProps {
    currentAmendmentCondition: IPermitCondition;
    previousAmendmentCondition: IPermitCondition;
}

/**
 * View that compares the current permit condition (including children conditions) with the previous permit condition
 * in a diff viewer. Also displays the reports associated with the current and previous permit conditions.
 */
const ComparePermitConditionHistoryModal: FC<ComparePermitConditionHistoryModalProps> = (props) => {
    const { mineGuid, permitGuid, latestAmendment, previousAmendment } = usePermitConditions();

    const newMineReportPermitRequirements = useSelector(getReportRequirementsByCondition(
        permitGuid, latestAmendment.permit_amendment_guid, props.currentAmendmentCondition.permit_condition_id
    ));
    const previousMineReportPermitRequirements = useSelector(getReportRequirementsByCondition(
        permitGuid, previousAmendment?.permit_amendment_guid, props.previousAmendmentCondition?.permit_condition_id
    ));

    return (
        <FormWrapper name={"compare-conditions-form"} isModal scrollOnToggleEdit={false}>
            <Row gutter={6}>
                <Col span={24}>
                    <Typography.Title level={3}>Compare Conditions</Typography.Title>
                </Col>
                <Col span={24}>
                    <ConditionDiffViewer
                        mineGuid={mineGuid}
                        permitGuid={permitGuid}
                        latestAmendment={latestAmendment}
                        previousAmendment={previousAmendment}
                        currentCondition={props.currentAmendmentCondition}
                        previousCondition={props.previousAmendmentCondition}
                    />
                </Col>
                <Col span={12}>
                    <Typography.Title level={4}>Reports</Typography.Title>
                    <PermitConditionReportRequirements
                        requirements={previousMineReportPermitRequirements} />

                </Col>
                <Col span={12}>
                    <Typography.Title level={4}>Reports</Typography.Title>
                    <PermitConditionReportRequirements
                        requirements={newMineReportPermitRequirements} />

                </Col>
            </Row>
        </FormWrapper>
    );
};

export default ComparePermitConditionHistoryModal;