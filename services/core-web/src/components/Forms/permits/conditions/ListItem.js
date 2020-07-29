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
};

const ListItem = (props) => (
    <>
        <Row gutter={32}>
            <Col md={2}>
                a.
            </Col>
            <Col md={18}>
                <Row>
                    <Col>{props.condition.condition}</Col>
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

ListItem.propTypes = propTypes;
ListItem.defaultProps = defaultProps;

export default ListItem;