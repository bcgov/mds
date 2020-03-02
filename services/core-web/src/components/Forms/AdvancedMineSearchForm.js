import React, { Component } from "react";
import PropTypes from "prop-types";
import { isEmpty, some, negate } from "lodash";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Icon, Row } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  mineTenureTypes: CustomPropTypes.options.isRequired,
  mineCommodityOptions: CustomPropTypes.options.isRequired,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  mineStatusDropDownOptions: CustomPropTypes.options.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  reset: PropTypes.func.isRequired,
};

export class AdvancedMineSearchForm extends Component {
  state = {
    receivedFirstInitialValues: false,
    expandAdvancedSearch: false,
  };

  handleReset = () => {
    this.props.reset();
    this.props.handleReset();
  };

  toggleIsAdvancedSearch = () =>
    this.setState((prevState) => ({
      expandAdvancedSearch: !prevState.expandAdvancedSearch,
    }));

  haveAdvancedSearchFilters = ({ status, region, tenure, commodity, tsf, major }) =>
    tsf || major || some([status, region, tenure, commodity], negate(isEmpty));

  componentWillReceiveProps = (nextProps) => {
    if (
      !this.state.receivedFirstInitialValues &&
      this.props.initialValues !== nextProps.initialValues
    ) {
      this.setState({
        receivedFirstInitialValues: true,
        expandAdvancedSearch: this.haveAdvancedSearchFilters(nextProps.initialValues),
      });
    }
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={24} xs={24}>
            <Field
              id="search"
              name="search"
              placeholder="Search by mine name, ID, or permit number"
              component={renderConfig.FIELD}
              allowClear
            />
          </Col>
        </Row>
        {this.state.expandAdvancedSearch && (
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
                    { value: "true", label: "Mines With TSFs" },
                    { value: "false", label: "Mines Without TSFs" },
                  ]}
                />
              </Col>
            </Row>
          </div>
        )}
        <div className="left center-mobile">
          <Button className="btn--dropdown" onClick={this.toggleIsAdvancedSearch}>
            {this.state.expandAdvancedSearch ? "Collapse Filters" : "Expand Filters"}
            <Icon type={this.state.expandAdvancedSearch ? "up" : "down"} />
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

export default reduxForm({
  form: FORM.MINE_ADVANCED_SEARCH,
  touchOnBlur: false,
  enableReinitialize: true,
})(AdvancedMineSearchForm);
