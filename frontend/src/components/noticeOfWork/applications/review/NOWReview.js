import React from "react";
import { PropTypes } from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Divider, Row, Col } from "antd";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import * as FORM from "@/constants/forms";
import ScrollContentWrapper from "@/components/common/wrappers/ScrollContentWrapper";

/**
 * @constant NOWReview renders edit/view for the NoW Application review step
 */

const propTypes = {
  // isViewMode is being passed into field Component, thus NOWReview.js assumes it isn't being used
  // eslint-disable-next-line
  isViewMode: PropTypes.bool.isRequired,
};

export const NOWReview = (props) => {
  const renderApplicationInfo = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Name of Property</div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title"> Permit Status </div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Mine Number</div>
          <Field id="mine_no" name="mine_no" component={RenderField} disabled />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Individual or Company/Organization?</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Region</div>
          <Field
            id="pproperty_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Relationship to Individual or Company/Organization?</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Lat</div>
          <Field
            id="latitude"
            name="latitude"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Description of Land</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Long</div>
          <Field
            id="longitude"
            name="longitude"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Type of Application</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Type of Notice of Work</div>
          <Field
            id="notice_of_work_type_code"
            name="notice_of_work_type_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Term of Application</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Permit Type</div>
          <Field
            id="pproperty_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed Start Date</div>
          <Field
            id="proposed_start_date"
            name="proposed_start_date"
            component={RenderDate}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Crown Grant / District Lot Numbers</div>
          <Field
            id="pproperty_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed End Date</div>
          <Field
            id="proposed_end_date"
            name="proposed_end_date"
            component={RenderDate}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Tenure Number(s)</div>
          <Field
            id="tenure_number"
            name="tenure_number"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );

  return (
    <div>
      <Form layout="vertical" onSubmit={() => console.log("submitting form")}>
        <div className="side-menu--content">
          <h2>General Information</h2>
          <Divider />
          <ScrollContentWrapper id="application-info" title="Application Info">
            {renderApplicationInfo()}
          </ScrollContentWrapper>
          <ScrollContentWrapper id="contacts" title="Contacts">
            <h1>Contacts</h1>
          </ScrollContentWrapper>
          <ScrollContentWrapper id="access" title="Access">
            <h1>Access</h1>
          </ScrollContentWrapper>
          <ScrollContentWrapper id="state-of-land" title="State of Land">
            <h1>State of Land</h1>
          </ScrollContentWrapper>
        </div>
      </Form>
    </div>
  );
};

NOWReview.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_NOTICE_OF_WORK,
  touchOnBlur: true,
})(NOWReview);
