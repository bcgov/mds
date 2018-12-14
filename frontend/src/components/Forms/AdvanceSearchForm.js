import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col } from "antd";
import * as FORM from "@/constants/forms";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  mineTenureTypes: PropTypes.array.isRequired,
  mineRegionOptions: PropTypes.array.isRequired,
  mineStatusOptions: PropTypes.array.isRequired,
};

export const AdvanceSearchForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Col md={12} xs={24}>
      <Form.Item>
        <Field
          id="status"
          name="status"
          placeholder="Select mine status"
          component={renderConfig.MULTI_SELECT}
          data={props.mineStatusOptions}
        />
      </Form.Item>
    </Col>
    <Col md={12} xs={24}>
      <Form.Item>
        <Field
          id="region"
          name="region"
          placeholder="Select mine region"
          component={renderConfig.MULTI_SELECT}
          data={props.mineRegionOptions}
        />
      </Form.Item>
    </Col>
    <Col md={12} xs={24}>
      <Form.Item>
        <Field
          id="tenure"
          name="tenure"
          placeholder="Select mine tenure"
          component={renderConfig.MULTI_SELECT}
          data={props.mineTenureTypes}
        />
      </Form.Item>
    </Col>
    {/* Commented out until backend is ready for Commodity */}
    {/* <Col md={12} xs={24}> */}
    {/* <Form.Item>
          <Field
            id="commodity"
            name="commodity"
            placeholder="Select mine commodity"
            component={renderConfig.MULTI_SELECT}
            data={props.mineStatusOptions}
          />
        </Form.Item> */}
    {/* </Col> */}
    <Col md={12}>
      <Form.Item>
        <Field
          id="major"
          name="major"
          label="Major Mine"
          type="checkbox"
          component={renderConfig.CHECKBOX}
        />
      </Form.Item>
    </Col>
    <Col md={12}>
      <Form.Item>
        <Field id="TSF" name="TSF" label="TSF" type="checkbox" component={renderConfig.CHECKBOX} />
      </Form.Item>
    </Col>
    {/* </Row> */}
    <div className="right center-mobile">
      <Button className="full-mobile" type="secondary">
        Clear Filters
      </Button>
      <Button className="full-mobile" type="primary" htmlType="submit">
        Apply Filters
      </Button>
    </div>
  </Form>
);

AdvanceSearchForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADVANCE_SEARCH,
  touchOnBlur: false,
})(AdvanceSearchForm);
