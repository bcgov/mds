import React from "react";
import Highlight from "react-highlighter";
import { Checkbox, Col, Collapse, Input } from "antd";
import customPropTypes from "@/customPropTypes";

const { Panel } = Collapse;

const propTypes = {
  requirements: customPropTypes.requirements.isRequired,
  sub_requirement: customPropTypes.subRequirements.isRequired,
};

const renderSubrequirement = (item) => item.map((it) => <Subrequirement sub_requirement={it} />);

const ReviewSubmitInformationRequirementsTable = ({ requirements }) => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <br />
      <Panel header={<span>{`${requirements?.description}`}</span>} key="1">
        {requirements !== undefined ? renderSubrequirement(requirements?.sub_requirements) : null}
      </Panel>
    </Collapse>
  );
};

const Subrequirement = ({ sub_requirement }) => (
  <>
    <Col span={24}>
      <p>
        <Highlight>{`${sub_requirement.step} ${sub_requirement.description}`}</Highlight>
      </p>
      <p>
        <Checkbox checked={sub_requirement.required}>Required</Checkbox>
        <Checkbox checked={sub_requirement.methods}>Methods</Checkbox>
      </p>
      <p>
        <Input.TextArea
          rows={4}
          value={sub_requirement.comment ? sub_requirement.comment : ""}
          name="comment"
        />
      </p>
    </Col>
    {sub_requirement.sub_requirements && renderSubrequirement(sub_requirement.sub_requirements)}
  </>
);

ReviewSubmitInformationRequirementsTable.propTypes = propTypes.requirements;
Subrequirement.propTypes = propTypes.sub_requirement;

export default ReviewSubmitInformationRequirementsTable;
