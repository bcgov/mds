import React from "react";
import { Checkbox, Col, Collapse, Input, Typography } from "antd";
import customPropTypes from "@/customPropTypes";

const { Panel } = Collapse;
const { Title } = Typography;

const propTypes = {
  requirements: customPropTypes.requirements.isRequired,
  sub_requirement: customPropTypes.subRequirements.isRequired,
};

const renderSubrequirement = (item) => item.map((it) => <Subrequirement sub_requirement={it} />);

const ReviewSubmitInformationRequirementsTable = ({ requirements }) => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <br />
      <Panel header={<Title level={5}>{`${requirements?.description}`}</Title>} key="1">
        {requirements !== undefined ? renderSubrequirement(requirements?.sub_requirements) : null}
      </Panel>
    </Collapse>
  );
};

// Apply font size depending the level of requirement description:
// 1.1 => 16px bold. , 1.2.1 => 14px bold, 1.2.1.1 => 14 px
const DescriptionTextStyle = (step) => {
  if (step.match(/\./g).length === 2) {
    return { fontWeight: "bold", fontSize: "16px" };
  }
  if (step.match(/\./g).length === 3) {
    return { fontWeight: "bold", fontSize: "14px" };
  }
  return { fontSize: "14px" };
};

const Subrequirement = ({ sub_requirement }) => (
  <>
    <Col span={24}>
      <span id="description" style={DescriptionTextStyle(sub_requirement.step)}>
        {`${sub_requirement.step} ${sub_requirement.description}`}
      </span>
      <>
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
      </>
    </Col>
    {sub_requirement.sub_requirements && renderSubrequirement(sub_requirement.sub_requirements)}
  </>
);

ReviewSubmitInformationRequirementsTable.propTypes = propTypes.requirements;
Subrequirement.propTypes = propTypes.sub_requirement;

export default ReviewSubmitInformationRequirementsTable;
