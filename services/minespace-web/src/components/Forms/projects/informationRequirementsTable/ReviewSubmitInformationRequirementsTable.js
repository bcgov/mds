import React from "react";
import Highlight from "react-highlighter";
import { Checkbox, Col, Collapse, Input } from "antd";
import customPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";

const { Panel } = Collapse;

const propTypes = {
  requirements: customPropTypes.requirements.isRequired,
  sub_requirement: PropTypes.objectOf(customPropTypes.subRequirements).isRequired,
};

const renderSubrequirement = (item) => item.map((it) => <Subrequirement sub_requirement={it} />);

function ReviewSubmitInformationRequirementsTable(props) {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <br />
      <Panel header={<span>{`${props.requirements?.description}`}</span>} key="1">
        {props.requirements !== undefined
          ? renderSubrequirement(props.requirements?.sub_requirements)
          : null}
      </Panel>
    </Collapse>
  );
}

const Subrequirement = (props) => (
  <>
    <Col span={24}>
      <p>
        <Highlight>{`${props.sub_requirement.step} ${props.sub_requirement.description}`}</Highlight>
      </p>
      <p>
        <Checkbox checked={props.sub_requirement.required}>Required</Checkbox>
        <Checkbox checked={props.sub_requirement.methods}>Methods</Checkbox>
      </p>
      <p>
        <Input.TextArea
          rows={4}
          value={props.sub_requirement.comment ? props.sub_requirement.comment : ""}
          name="comment"
        />
      </p>
    </Col>
    {props.sub_requirement.sub_requirements &&
      renderSubrequirement(props.sub_requirement.sub_requirements)}
  </>
);

ReviewSubmitInformationRequirementsTable.propTypes = propTypes;

export default ReviewSubmitInformationRequirementsTable;
