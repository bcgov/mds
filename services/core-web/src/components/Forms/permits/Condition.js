import React from "react";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm, Button } from "antd";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import AddButton from "@/components/common/AddButton";

const propTypes = {
    condition: PropTypes.objectOf(PropTypes.any)
};

const defaultProps = {
    condition: { 'condition_title': 'Mine Emergency Response Plan', 'condition': 'The Mine Emergency Response Plan ("MERP") must be implemented prior to commencement. In addition to addressing daily operational issues, the plan shall specifically address emergency evacuation of personnel due to injury and forest fire hazard. All persons employed or visiting on the mine shall be trained with the MERP. The plan shall be available on site for review upon request and must be updated as changes arise.', 'condition_category': 'HSC' }
};

const Condition = (props) => (
    <>
        <Row gutter={32}>
            <Col md={2}>
                1.
            </Col>
            <Col md={18}>
                <Row>
                    <Col className="field-title">
                        {props.condition.condition_title}
                    </Col>
                </Row>
                <Row>
                    <Col>{props.condition.condition}</Col>
                </Row>
                <Row>
                    <Col>
                        <AddButton>Add List Item</AddButton>
                        <AddButton>Add Condition</AddButton>
                    </Col>
                </Row>
            </Col>
            <Col md={4}>
                <div align="right" className="btn--middle flex">
                    <AuthorizationWrapper permission={Permission.ADMIN}>
                        <Button
                            type="primary"
                            size="small"
                            ghost
                            onClick={() => { }}
                        >
                            <img src={EDIT_OUTLINE_VIOLET} alt="Edit Condition" />
                        </Button>
                    </AuthorizationWrapper>
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
                </div>
            </Col>
        </Row>
    </>
);

Condition.propTypes = propTypes;
Condition.defaultProps = defaultProps;

export default Condition;