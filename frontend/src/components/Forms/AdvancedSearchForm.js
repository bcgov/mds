import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { optionsType } from "@/types";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  mineTenureTypes: optionsType.isRequired,
  mineRegionOptions: optionsType.isRequired,
  mineStatusOptions: optionsType.isRequired,
};

export class AdvancedSearchForm extends Component {
  handleReset = () => {
    this.props.reset();
    this.props.handleSearch();
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="status"
                name="status"
                placeholder="Select mine status"
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
                placeholder="Select mine region"
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
                placeholder="Select mine tenure"
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
                placeholder="Select mine commodity"
                component={renderConfig.MULTI_SELECT}
                data={this.props.mineStatusOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={6}>
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
              <Field
                id="tsf"
                name="tsf"
                label="TSF"
                type="checkbox"
                component={renderConfig.CHECKBOX}
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
