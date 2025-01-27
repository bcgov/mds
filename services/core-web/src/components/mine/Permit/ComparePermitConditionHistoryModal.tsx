import React, { FC } from "react";
import { Col, Row, Typography } from "antd";
import { getConditionsWithRequirements, IMineReportPermitRequirement, IPermitAmendment, IPermitCondition } from "@mds/common/interfaces";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import ConditionDiffViewer from "./ConditionDiffViewer";
import PermitConditionReportRequirements from "./PermitConditionReportRequirements";
import { getMineReportPermitRequirements } from "@mds/common/redux/selectors/permitSelectors";
import { useSelector } from "react-redux";

export interface ComparePermitConditionHistoryModalProps {
    currentAmendmentCondition: IPermitCondition;
    previousAmendmentCondition: IPermitCondition;
    mineGuid: string;
    permitGuid: string;
    latestAmendment: IPermitAmendment;
    previousAmendment?: IPermitAmendment;
}

const ComparePermitConditionHistoryModal: FC<ComparePermitConditionHistoryModalProps> = (props) => {

    const mineReportPermitRequirements: IMineReportPermitRequirement[] = useSelector(
        getMineReportPermitRequirements(props.permitGuid)
    );

    const oldReports = getConditionsWithRequirements([props.previousAmendmentCondition], mineReportPermitRequirements);
    const newReports = getConditionsWithRequirements([props.currentAmendmentCondition], mineReportPermitRequirements);

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
                        conditionsWithRequirements={oldReports}
                        permitGuid={props.permitGuid}
                        handleEditReportRequirement={() => { }} />

                </Col>
                <Col span={12}>
                    <Typography.Title level={4}>Reports</Typography.Title>
                    <PermitConditionReportRequirements
                        conditionsWithRequirements={newReports}
                        permitGuid={props.permitGuid}
                        handleEditReportRequirement={() => { }} />

                </Col>
            </Row>
            <div className="ant-modal-footer" />
        </FormWrapper>
    );
};

export default ComparePermitConditionHistoryModal;