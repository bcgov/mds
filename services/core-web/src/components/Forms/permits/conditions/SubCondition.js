import React, { useState } from 'react';
import PropTypes from "prop-types";
import { Col, Row, Popconfirm, Button } from "antd";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/AddButton";
import Condition from "@/components/Forms/permits/conditions/Condition";
import AddCondition from "@/components/Forms/permits/conditions/AddCondition";
import SubConditionForm from "./SubConditionForm";
import { maxBy } from "lodash";

const propTypes = {
    condition: PropTypes.objectOf(PropTypes.any),
    new: PropTypes.bool,
    handleSubmit: PropTypes.func,
    initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
    condition: {
        step: '',
        condition: '',
        sub_conditions: []
    },
    new: false,
    handleSubmit: () => { },
    initialValues: {}
};

const SubCondition = (props) => {
    const [isEditing, setIsEditing] = useState(props.new);
    return (
        <>
            {props.condition.display_order !== 1 && <><Row gutter={32}><Col>&nbsp;</Col></Row><Row gutter={32}><Col>&nbsp;</Col></Row></>}
            <Row gutter={32}>
                {!isEditing && <><Col span={1} />
                    <Col span={1}>
                        {!isEditing && props.condition.step}
                    </Col></>}
                <Col span={20}>
                    <Row>
                        <Col>{!isEditing && props.condition.condition}</Col>
                    </Row>
                    <Row>
                        <Col>
                            {isEditing && (<SubConditionForm onCancel={props.handleCancel} onSubmit={props.handleSubmit} initialValues={props.initialValues} />)}
                        </Col>
                    </Row>
                </Col>
                <Col span={2} className="float-right">
                    {!isEditing &&
                        (
                            <AuthorizationWrapper permission={Permission.ADMIN}>
                                <Popconfirm
                                    placement="topLeft"
                                    title="Are you sure you want to delete this condition?"
                                    onConfirm={() => { }}
                                    okText="Delete"
                                    cancelText="Cancel"
                                >
                                    <Button ghost size="small" type="primary">
                                        <img name="remove" src={TRASHCAN} alt="Remove Condition" />
                                    </Button>
                                </Popconfirm>
                            </AuthorizationWrapper>
                        )}
                </Col>
            </Row>
            {props.condition.sub_conditions.map((condition) => <Condition condition={condition} />)}
            {props.condition.sub_conditions.length === 0 && <Row gutter={32}><Col>&nbsp;</Col></Row>}
            {!isEditing && (
                <Row gutter={32}>
                    <Col span={22} offset={2}>
                        <AddCondition initialValues={
                            {
                                condition_category_code: props.condition.condition_category_code,
                                condition_type_code: 'LIS',
                                display_order: props.condition.sub_conditions.length === 0 ? 1 : maxBy(props.condition.sub_conditions, 'display_order').display_order + 1,
                                parent_condition_id: props.condition.permit_condition_id,
                                permit_amendment_id: props.condition.permit_amendment_id
                            }} />
                    </Col>
                </Row>
            )}
        </>
    )
};

SubCondition.propTypes = propTypes;
SubCondition.defaultProps = defaultProps;

export default SubCondition;