import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import RenderField from "@/components/common/RenderField";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
};

export const UndergroundExploration = (props) => {
  return (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed Activities**</div>
          <Field id="" name="" component={RenderField} disabled={props.isViewMode} />
        </Col>
      </Row>
    </div>
  );
};

UndergroundExploration.propTypes = propTypes;

export default UndergroundExploration;
