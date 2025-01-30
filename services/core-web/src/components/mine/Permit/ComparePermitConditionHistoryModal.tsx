import React, { FC } from "react";
import { Col, Row, Typography } from "antd";
import { getConditionsWithRequirements, IMineReportPermitRequirement, IPermitAmendment, IPermitCondition } from "@mds/common/interfaces";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import ConditionDiffViewer from "./ConditionDiffViewer";
import PermitConditionReportRequirements from "./PermitConditionReportRequirements";
import { getMineReportPermitRequirements, getMineReportPermitRequirementsByAmendment } from "@mds/common/redux/selectors/permitSelectors";
import { useSelector } from "react-redux";

export interface ComparePermitConditionHistoryModalProps {
    currentAmendmentCondition: IPermitCondition;
    previousAmendmentCondition: IPermitCondition;
    mineGuid: string;
    permitGuid: string;
    latestAmendment: IPermitAmendment;
    previousAmendment?: IPermitAmendment;
}

/**
 * View that compares the current permit condition (including children conditions) with the previous permit condition
 * in a diff viewer. Also displays the reports associated with the current and previous permit conditions.
 */
const ComparePermitConditionHistoryModal: FC<ComparePermitConditionHistoryModalProps> = (props) => {

    const newMineReportPermitRequirements: IMineReportPermitRequirement[] = useSelector(
        getMineReportPermitRequirements(props.permitGuid)
    );

    const previousMineReportPermitRequirements: IMineReportPermitRequirement[] = useSelector(
        getMineReportPermitRequirementsByAmendment(props.permitGuid, props.previousAmendment?.permit_amendment_guid)
    );

    const oldReports = getConditionsWithRequirements([props.currentAmendmentCondition], previousMineReportPermitRequirements);
    const newReports = getConditionsWithRequirements([props.currentAmendmentCondition], newMineReportPermitRequirements);

    return (
        <FormWrapper name={"test"} isModal onSubmit={() => { }}>
            <Row gutter={6}>
                <Col span={24}>
                    <Typography.Title level={3}>Compare Conditions</Typography.Title>
                </Col>
                <Col span={24}>
                    <ConditionDiffViewer
                        mineGuid={props.mineGuid}
                        permitGuid={props.permitGuid}
                        latestAmendment={props.latestAmendment}
                        previousAmendment={props.previousAmendment}
                        currentCondition={props.currentAmendmentCondition}
                        previousCondition={props.previousAmendmentCondition}
                    />
                </Col>
                <Col span={12}>
                    <Typography.Title level={4}>Reports</Typography.Title>
                    <PermitConditionReportRequirements
                        conditionsWithRequirements={oldReports} />

                </Col>
                <Col span={12}>
                    <Typography.Title level={4}>Reports</Typography.Title>
                    <PermitConditionReportRequirements
                        conditionsWithRequirements={newReports} />

                </Col>
            </Row>
            <div className="ant-modal-footer" />
        </FormWrapper>
    );
};

export default ComparePermitConditionHistoryModal;