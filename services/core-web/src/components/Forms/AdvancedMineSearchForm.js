import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Icon, Row } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  searchValue: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  toggleAdvancedSearch: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  mineTenureTypes: CustomPropTypes.options.isRequired,
  mineCommodityOptions: CustomPropTypes.options.isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  mineStatusDropDownOptions: CustomPropTypes.options.isRequired,
  isAdvanceSearch: PropTypes.bool.isRequired,
};

const defaultProps = {
  searchValue: "",
};

export class AdvancedMineSearchForm extends Component {
  handleReset = () => {
    this.props.reset();
    this.props.handleSearch({}, true);
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={24} xs={24}>
            <Field
              id="search"
              name="search"
              component={renderConfig.FIELD}
              defaultValue={this.props.searchValue ? this.props.searchValue : undefined}
              placeholder="Search by mine name, ID, or permit number"
            />
          </Col>
        </Row>
        {this.props.isAdvanceSearch && (
          <div>
            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="status"
                  name="status"
                  placeholder="Select Mine Status"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.mineStatusDropDownOptions}
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
                <Field
                  id="tenure"
                  name="tenure"
                  placeholder="Select Mine Tenure"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.mineTenureTypes}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="commodity"
                  name="commodity"
                  placeholder="Select Mine Commodity"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.mineCommodityOptions}
                />
              </Col>
            </Row>
            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="major"
                  name="major"
                  component={renderConfig.SELECT}
                  data={[
                    { value: "", label: "Major and Regional Mines" },
                    { value: "true", label: "Major Mine" },
                    { value: "false", label: "Regional Mine" },
                  ]}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="tsf"
                  name="tsf"
                  component={renderConfig.SELECT}
                  data={[
                    { value: "", label: "Mines With and Without TSFs" },
                    { value: "false", label: "Mines Without TSFs" },
                    { value: "true", label: "Mines With TSFs" },
                  ]}
                />
              </Col>
            </Row>
          </div>
        )}
        <div className="left center-mobile">
          <Button className="btn--dropdown" onClick={this.props.toggleAdvancedSearch}>
            {this.props.isAdvanceSearch ? "Collapse Filters" : "Expand Filters"}
            <Icon type={this.props.isAdvanceSearch ? "up" : "down"} />
          </Button>
        </div>
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

AdvancedMineSearchForm.propTypes = propTypes;
AdvancedMineSearchForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.MINE_ADVANCED_SEARCH,
  touchOnBlur: false,
})(AdvancedMineSearchForm);
