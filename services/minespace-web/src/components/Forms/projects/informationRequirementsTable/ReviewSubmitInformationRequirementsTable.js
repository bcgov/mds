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
    <Col style={{ width: "100%" }} span={24}>
      <span
        id="description"
        style={
          props.sub_requirement.step.match(/\./g).length === 2
            ? { fontWeight: "bold", fontSize: "16px" }
            : props.sub_requirement.step.match(/\./g).length === 3
            ? { fontWeight: "bold", fontSize: "14px" }
            : { fontSize: "14px" }
        }
      >
        {`${props.sub_requirement.step} ${props.sub_requirement.description}`}
      </span>

      {props.sub_requirement.required === undefined &&
      props.sub_requirement.methods === undefined ? null : (
        <>
          <p>
            <Checkbox checked={props.sub_requirement.required.toLowerCase() === "true"}>
              Required
            </Checkbox>
            <Checkbox checked={props.sub_requirement.methods.toLowerCase() === "true"}>
              Methods
            </Checkbox>
          </p>
          <p>
            <Input.TextArea
              rows={4}
              value={props.sub_requirement.comment ? props.sub_requirement.comment : ""}
              name="comment"
            />
          </p>
        </>
      )}
    </Col>
    {props.sub_requirement.sub_requirements &&
      renderSubrequirement(props.sub_requirement.sub_requirements)}
  </>
);

ReviewSubmitInformationRequirementsTable.propTypes = propTypes;

export default ReviewSubmitInformationRequirementsTable;
