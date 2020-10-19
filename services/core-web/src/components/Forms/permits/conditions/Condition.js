import React from "react";
import PropTypes from "prop-types";
import SubCondition from "@/components/Forms/permits/conditions/SubCondition";
import Section from "@/components/Forms/permits/conditions/Section";
import ListItem from "@/components/Forms/permits/conditions/ListItem";

const propTypes = {
  condition: PropTypes.objectOf(PropTypes.any).isRequired,
};

const ConditionComponent = (props) =>
  ({
    SEC: <Section {...props} />,
    CON: <SubCondition {...props} />,
    LIS: <ListItem {...props} />,
  }[props.condition.condition_type_code]);

const Condition = (props) => <ConditionComponent {...props} />;

Condition.propTypes = propTypes;

export default Condition;
