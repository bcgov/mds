import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Icon, Row } from "antd";
import { phoneNumber, maxLength } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleNameFieldReset: PropTypes.func.isRequired,
  toggleAdvancedSearch: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  partyTypeOptions: CustomPropTypes.options.isRequired,
  relationshipTypes: CustomPropTypes.options.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string).isRequired,
  isAdvanceSearch: PropTypes.bool,
};

const defaultProps = {
  isAdvanceSearch: false,
};

const isPerson = (type) => type === "PER";
const isOrg = (type) => type === "ORG";

export class AdvancedContactSearchForm extends Component {
  state = {
    contactType: this.props.initialValues.type,
  };

  handleReset = () => {
    this.props.reset();
    this.props.handleSearch({}, true);
    this.handleContactTypeChange(null, "PER");
  };

  handleContactTypeChange = (chars, value) => {
    this.setState({ contactType: value }, () => this.props.handleNameFieldReset());
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={6} xs={6}>
            <Field
              id="type"
              name="type"
              placeholder="Party Type"
              component={renderConfig.SELECT}
              data={this.props.partyTypeOptions}
              onChange={this.handleContactTypeChange}
            />
          </Col>
          {isOrg(this.state.contactType) && (
            <Col md={18} xs={18}>
              <Field
                id="party_name"
                name="party_name"
                placeholder="Organization Name"
                component={renderConfig.FIELD}
              />
            </Col>
          )}
          {isPerson(this.state.contactType) && (
            <Col md={9} xs={9}>
              <Field
                id="first_name"
                name="first_name"
                placeholder="First Name"
                component={renderConfig.FIELD}
              />
            </Col>
          )}
          {isPerson(this.state.contactType) && (
            <Col md={9} xs={9}>
              <Field
                id="last_name"
                name="last_name"
                placeholder="Last Name"
                component={renderConfig.FIELD}
              />
            </Col>
          )}
        </Row>
        {this.props.isAdvanceSearch && (
          <div>
            <Row gutter={6}>
              <Col md={8} xs={24}>
                <Field id="email" name="email" placeholder="Email" component={renderConfig.FIELD} />
              </Col>
              <Col md={8} xs={24}>
                <Field
                  id="phone_no"
                  name="phone_no"
                  placeholder="Phone Number"
                  component={renderConfig.FIELD}
                  validate={[phoneNumber, maxLength(12)]}
                />
              </Col>
              <Col md={8} xs={24}>
                <Field
                  id="role"
                  name="role"
                  placeholder="Role"
                  component={renderConfig.SELECT}
                  data={this.props.relationshipTypes}
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

AdvancedContactSearchForm.propTypes = propTypes;
AdvancedContactSearchForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.CONTACT_ADVANCED_SEARCH,
  touchOnBlur: false,
  enableReinitialize: true,
})(AdvancedContactSearchForm);
