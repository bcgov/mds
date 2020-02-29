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

const haveAdvancedSearchFilters = ({ status, region, tenure, commodity, tsf, major }) =>
  tsf || major || some([status, region, tenure, commodity], negate(isEmpty));

export class AdvancedMineSearchForm extends Component {
  state = {
    isAdvancedSearch: haveAdvancedSearchFilters(this.props.initialValues),
    isAdvancedSearchToggled: haveAdvancedSearchFilters(this.props.initialValues),
  };

  handleReset = () => {
    this.props.reset();
    this.props.handleReset();
  };

  toggleIsAdvancedSearch = () =>
    this.setState((prevState) => ({
      isAdvancedSearchToggled: !prevState.isAdvancedSearchToggled,
      isAdvancedSearch: false,
    }));

  componentWillReceiveProps = (nextProps) => {
    if (this.props.initialValues !== nextProps.initialValues) {
      this.setState({
        isAdvancedSearch: haveAdvancedSearchFilters(nextProps.initialValues),
      });
    }
  };

  render() {
    const shouldExpandAdvancedSearch =
      this.state.isAdvancedSearchToggled || this.state.isAdvancedSearch;
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
        {shouldExpandAdvancedSearch && (
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
            {shouldExpandAdvancedSearch ? "Collapse Filters" : "Expand Filters"}
            <Icon type={shouldExpandAdvancedSearch ? "up" : "down"} />
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
