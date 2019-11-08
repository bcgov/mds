import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
};

export const Camps = (props) => {
  return (
    <div>
      {/* <br />
      <h4>Camps</h4>

      <br />
      <h4>Buildings</h4>

      <br />
      <h4>Staging Area</h4> */}
      <br />
      <h4>Fuel</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Do you propose to store fuel?**</div>
          <Field
            id="has_fuel_stored"
            name="has_fuel_stored"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Storage Method**</div>
          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                label="Bulk"
                id="has_fuel_stored_in_bulk"
                name="has_fuel_stored_in_bulk"
                component={RenderRadioButtons}
                disabled={props.isViewMode}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field
                label="Barrell"
                id="has_fuel_stored_in_barrels"
                name="has_fuel_stored_in_barrels"
                component={RenderRadioButtons}
                disabled={props.isViewMode}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Describe the proposed reclamation and timing for this specific activity**
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
            Estimated Cost of reclamation activities described above**
          </div>
          <Field
            id="reclamation_cost"
            name="reclamation_cost"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );
};

Camps.propTypes = propTypes;

export default Camps;
