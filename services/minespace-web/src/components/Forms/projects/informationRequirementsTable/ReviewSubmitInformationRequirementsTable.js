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

const Subrequirement = ({ sub_requirement }) => (
  <>
    <Col span={24}>
      <span
        id="description"
        style={
          sub_requirement.step.match(/\./g).length === 2
            ? { fontWeight: "bold", fontSize: "16px" }
            : sub_requirement.step.match(/\./g).length === 3
            ? { fontWeight: "bold", fontSize: "14px" }
            : { fontSize: "14px" }
        }
      >
        {`${sub_requirement.step} ${sub_requirement.description}`}
      </span>

      {sub_requirement.required === undefined && sub_requirement.methods === undefined ? null : (
        <>
          <p>
            <Checkbox checked={sub_requirement.required.toLowerCase() === "true"}>
              Required
            </Checkbox>
            <Checkbox checked={sub_requirement.methods.toLowerCase() === "true"}>Methods</Checkbox>
          </p>
          <p>
            <Input.TextArea
              rows={4}
              value={sub_requirement.comment ? sub_requirement.comment : ""}
              name="comment"
            />
          </p>
        </>
      )}
    </Col>
    {sub_requirement.sub_requirements && renderSubrequirement(sub_requirement.sub_requirements)}
  </>
);

ReviewSubmitInformationRequirementsTable.propTypes = propTypes.requirements;
Subrequirement.propTypes = propTypes.sub_requirement;

export default ReviewSubmitInformationRequirementsTable;
