import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
};

export const SurfaceDrilling = (props) => {
  return (
    <div>
      {/* <br />
      <h4>Drilling</h4> */}
      <br />
      <h4>Support of the Drilling Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">The Drilling program will be</div>
          <Field
            id="reclamation_core_storage"
            name="reclamation_core_storage"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity
          </div>
          <Field
            id="reclamation_description"
            name="reclamation_description"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Estimated Cost of reclamation activities described above
          </div>
          <Field
            id="reclamation_description"
            name="reclamation_description"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );
};

SurfaceDrilling.propTypes = propTypes;

export default SurfaceDrilling;
