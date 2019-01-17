import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  mineTenureTypes: CustomPropTypes.options.isRequired,
  mineCommodityOptions: CustomPropTypes.options.isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  mineStatusOptions: CustomPropTypes.options.isRequired,
};

export class AdvancedSearchForm extends Component {
  handleReset = () => {
    this.props.reset();
    this.props.handleSearch();
  };

  componentDidMount() {
    console.log(this.props.mineCommodityOptions);
    console.log(this.props);
  }

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="status"
                name="status"
                placeholder="Select Mine Status"
                component={renderConfig.MULTI_SELECT}
                data={this.props.mineStatusOptions}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="region"
                name="region"
                placeholder="Select Mine Region"
                component={renderConfig.MULTI_SELECT}
                data={this.props.mineRegionOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={6}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="tenure"
                name="tenure"
                placeholder="Select Mine Tenure"
                component={renderConfig.MULTI_SELECT}
                data={this.props.mineTenureTypes}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="commodity"
                name="commodity"
                placeholder="Select Mine Commodity"
                component={renderConfig.MULTI_SELECT}
                data={this.props.mineCommodityOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={6}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="major"
                name="major"
                placeholder="Select Mine Class"
                component={renderConfig.SELECT}
                data={[
                  { value: "true", label: "Major Mine" },
                  { value: "false", label: "Regional Mine" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="tsf"
                name="tsf"
                placeholder="Select TSF"
                component={renderConfig.SELECT}
                data={[
                  { value: "false", label: "No TSF" },
                  { value: "true", label: "One Or More TSFs" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="right center-mobile">
          <Button className="full-mobile" type="secondary" htmlType="reset">
            Clear Filters
          </Button>
          <Button className="full-mobile" type="primary" htmlType="submit">
            Apply Filters
          </Button>
        </div>
      </Form>
    );
  }
}

AdvancedSearchForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADVANCE_SEARCH,
  touchOnBlur: false,
})(AdvancedSearchForm);
