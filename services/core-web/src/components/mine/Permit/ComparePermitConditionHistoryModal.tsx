import React, { FC } from "react";
import { Col, Row, Typography } from "antd";
import { IPermitAmendment, IPermitCondition } from "@mds/common/interfaces";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import ConditionDiffViewer from "./ConditionDiffViewer";

interface ComparePermitConditionHistoryModalProps {
    currentAmendmentCondition: IPermitCondition;
    previousAmendmentCondition: IPermitCondition;
    mineGuid: string;
    permitGuid: string;
    latestAmendment: IPermitAmendment;
}

const ComparePermitConditionHistoryModal: FC<ComparePermitConditionHistoryModalProps> = (props) => {

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
                        currentCondition={props.currentAmendmentCondition}
                        previousCondition={props.previousAmendmentCondition}
                    />
                </Col>
            </Row>
            <div className="ant-modal-footer" />
        </FormWrapper>
    );
};

export default ComparePermitConditionHistoryModal;