import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Input, Icon, Row } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  searchValue: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  mineTenureTypes: CustomPropTypes.options.isRequired,
  mineCommodityOptions: CustomPropTypes.options.isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  mineStatusOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  searchValue: "",
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
    console.log("The props in the advanced search form are:");
    console.log(this.props);
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={24} xs={24}>
            {/* <Form.Item> */}
            <Field
              id="search"
              name="search"
              component={renderConfig.FIELD}
              defaultValue={this.props.searchValue ? this.props.searchValue : undefined}
              placeholder="Search for a mine using name, ID, or permit number"
              data={this.props.searchValue}
            />

            {/* <Input
                defaultValue={this.props.searchValue ? this.props.searchValue : undefined}
                placeholder="Search for a mine using name, ID, or permit number"
                // onChange={this.handleSearch}
                suffix={<Icon type="search" style={{ color: "#5e46a1", fontSize: 20 }} />}
              /> */}
            {/* <Field
                id="search"
                name="search"
                component={renderConfig.FIELD}
                defaultValue={this.props.searchValue ? this.props.searchValue : undefined}
                placeholder="Search for a mine using name, ID, or permit number"
              /> */}
            {/* </Form.Item> */}
            {/* <Input
              defaultValue={this.props.searchValue ? this.props.searchValue : undefined}
              placeholder="Search for a mine using name, ID, or permit number"
              // onChange={this.handleSearch}
              suffix={<Icon type="search" style={{ color: "#5e46a1", fontSize: 20 }} />}
            /> */}
            {/* <Form.Item>
              <Field
                id="status"
                name="status"
                placeholder="Select Mine Status"
                component={renderConfig.MULTI_SELECT}
                data={this.props.mineStatusOptions}
              />
            </Form.Item> */}
          </Col>
          {/* <Input
            defaultValue={this.props.searchValue ? this.props.searchValue : undefined}
            placeholder="Search for a mine using name, ID, or permit number"
            onChange={this.handleSearch}
            suffix={<Icon type="search" style={{ color: "#5e46a1", fontSize: 20 }} />}
          /> */}
        </Row>
        <Row gutter={6}>
          <Col md={12} xs={24}>
            <Field
              id="status"
              name="status"
              placeholder="Select Mine Status"
              component={renderConfig.MULTI_SELECT}
              data={this.props.mineStatusOptions}
            />
          </Col>
          <Col md={12} xs={24}>
            <Field
              id="region"
              name="region"
              placeholder="Select Mine Region"
              component={renderConfig.MULTI_SELECT}
              data={this.props.mineRegionOptions}
            />
          </Col>
        </Row>
        <Row gutter={6}>
          <Col md={12} xs={24}>
            {/* <Form.Item> */}
            <Field
              id="tenure"
              name="tenure"
              placeholder="Select Mine Tenure"
              component={renderConfig.MULTI_SELECT}
              data={this.props.mineTenureTypes}
            />
            {/* </Form.Item> */}
          </Col>
          <Col md={12} xs={24}>
            {/* <Form.Item> */}
            <Field
              id="commodity"
              name="commodity"
              placeholder="Select Mine Commodity"
              component={renderConfig.MULTI_SELECT}
              data={this.props.mineCommodityOptions}
            />
            {/* </Form.Item> */}
          </Col>
        </Row>
        <Row gutter={6}>
          <Col md={12} xs={24}>
            {/* <Form.Item> */}
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
            {/* </Form.Item> */}
          </Col>
          <Col md={12} xs={24}>
            {/* <Form.Item> */}
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
            {/* </Form.Item> */}
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
AdvancedSearchForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADVANCE_SEARCH,
  touchOnBlur: false,
})(AdvancedSearchForm);
