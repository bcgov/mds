import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Icon } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
// import { phoneNumber, maxLength } from "@/utils/Validate";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  // handleNameFieldReset: PropTypes.func.isRequired,
  toggleAdvancedSearch: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  // partyTypeOptions: CustomPropTypes.options.isRequired,
  // relationshipTypes: CustomPropTypes.options.isRequired,
  // initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
  isAdvanceSearch: PropTypes.bool,
  complianceCodes: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  isAdvanceSearch: false,
};

export class VarianceSearchForm extends Component {
  // state = {
  //   contactType: this.props.initialValues.type,
  // };

  handleReset = () => {
    this.props.reset();
    this.props.handleSearch({}, true);
  };

  // handleContactTypeChange = (chars, value) => {
  //   // this.setState({ contactType: value });
  //   // Set the first,last, and party names to null
  //   this.props.handleNameFieldReset();
  // };

  render() {
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%");
    console.log(this.props.complianceCodes);
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={24} xs={24}>
            <Field
              id="party_name"
              name="party_name"
              component={renderConfig.FIELD}
              placeholder="Organization Name"
            />
          </Col>
        </Row>
        {this.props.isAdvanceSearch && (
          <div>
            <Row gutter={6}>
              <Col md={24} xs={24}>
                <Field
                  id="compilance_code"
                  name="compilance_code"
                  placeholder="Select Compliance Code"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.complianceCodes}
                />
              </Col>
            </Row>
          </div>
        )}

        {/* // <div>
          //   <Row gutter={6}>
          //     <Col md={8} xs={24}>
          //       <Field 
          //         id="email"
          //         name="email"
          //         placeholder="Contact Email"
          //         component={renderConfig.FIELD}
          //       />
          //     </Col>
          //     <Col md={8} xs={24}>
          //       <Field
          //         id="phone_no"
          //         name="phone_no"
          //         placeholder="Phone Number"
          //         component={renderConfig.FIELD}
          //         validate={[phoneNumber, maxLength(12)]}
          //       />
          //     </Col>
          //     <Col md={8} xs={24}>
          //       <Field
          //         id="role"
          //         name="role"
          //         component={renderConfig.SELECT}
          //         data={this.props.relationshipTypes}
          //       />
          //     </Col>
          //   </Row>
          // </div>
        */}
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

VarianceSearchForm.propTypes = propTypes;
VarianceSearchForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.CONTACT_ADVANCED_SEARCH,
  touchOnBlur: false,
})(VarianceSearchForm);
