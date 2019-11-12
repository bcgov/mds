import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
};

export const Placer = (props) => {
  return (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Is this an application for Underground Placer Operations?
          </div>
          <Field
            id="is_underground"
            name="is_underground"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Is this an application for Hand Operations?</div>
          <Field
            id="is_hand_operation"
            name="is_hand_operation"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );
};

Placer.propTypes = propTypes;

export default Placer;
