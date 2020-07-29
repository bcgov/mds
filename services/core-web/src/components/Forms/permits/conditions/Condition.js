import React from "react";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm, Button } from "antd";
import SubCondition from "@/components/Forms/permits/conditions/SubCondition";
import Section from "@/components/Forms/permits/conditions/Section";
import ListItem from "@/components/Forms/permits/conditions/ListItem";

const propTypes = {
    condition: PropTypes.objectOf(PropTypes.any)
};

const defaultProps = {
};

const ConditionComponent = (props) =>
    ({
        'SEC': <Section {...props} />,
        'CON': <SubCondition {...props} />,
        'LST': <ListItem {...props} />,
    }[props.condition.condition_type]);

const Condition = (props) => (
    <Row>
        <Col>
            <ConditionComponent {...props} />
        </Col>
    </Row>
);

Condition.propTypes = propTypes;
Condition.defaultProps = defaultProps;

export default Condition;