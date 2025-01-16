import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Button, Col, Row } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { phoneNumber, maxLength } from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderResetButton from "@mds/common/components/forms/RenderResetButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleNameFieldReset: PropTypes.func.isRequired,
  toggleAdvancedSearch: PropTypes.func.isRequired,
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
    this.props.handleSearch({}, true);
    this.handleContactTypeChange(null, "PER");
  };

  handleContactTypeChange = (chars, value) => {
    this.setState({ contactType: value }, () => this.props.handleNameFieldReset());
  };

  render() {
    return (
      <FormWrapper
        initialValues={this.props.initialValues}
        name={FORM.CONTACT_ADVANCED_SEARCH}
        reduxFormConfig={{
          touchOnBlur: false,
          enableReinitialize: true,
        }}
        onSubmit={this.props.onSubmit} onReset={this.handleReset}>
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

            {this.props.isAdvanceSearch ? <UpOutlined /> : <DownOutlined />}
          </Button>
        </div>
        <div className="right center-mobile">
          <RenderResetButton buttonText="Clear Filters" className="full-mobile" />
          <Button className="full-mobile" type="primary" htmlType="submit">
            Apply Filters
          </Button>
        </div>
      </FormWrapper>
    );
  }
}

AdvancedContactSearchForm.propTypes = propTypes;
AdvancedContactSearchForm.defaultProps = defaultProps;

export default AdvancedContactSearchForm;
