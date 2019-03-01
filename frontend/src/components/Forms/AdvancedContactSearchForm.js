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
  roleOptions: CustomPropTypes.options.isRequired,
  isAdvanceSearch: PropTypes.bool.isRequired,
};

const defaultProps = {
  searchValue: "",
};

export class AdvancedContactSearchForm extends Component {
  state = {
    params: {
      type: this.props.contactType,
    },
  };

  handleReset = () => {
    this.props.reset();
    this.props.handleSearch();
  };

  handleContactTypeChange = (chars, value) => {
    this.setState({ params: { type: value } });
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit} onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={6} xs={6}>
            <Field
              id="type"
              name="type"
              placeholder="Type of Contact"
              component={renderConfig.SELECT}
              // TODO: Pass data in as props
              // TODO: Set initial value PER based on props.contactType
              data={[{ value: "PER", label: "Person" }, { value: "ORG", label: "Organization" }]}
              onChange={this.handleContactTypeChange}
            />
          </Col>
          {this.state.params.type === "ORG" && (
            <Col md={18} xs={18}>
              <Field
                id="party_name"
                name="party_name"
                component={renderConfig.FIELD}
                defaultValue={this.props.searchValue ? this.props.searchValue : undefined}
                placeholder="Organization Name"
              />
            </Col>
          )}
          {this.state.params.type === "PER" && (
            <Col md={9} xs={9}>
              <Field
                id="first_name"
                name="first_name"
                component={renderConfig.FIELD}
                placeholder="First Name"
              />
            </Col>
          )}
          {this.state.params.type === "PER" && (
            <Col md={9} xs={9}>
              <Field
                id="last_name"
                name="last_name"
                component={renderConfig.FIELD}
                placeholder="Surname"
              />
            </Col>
          )}
        </Row>
        {this.props.isAdvanceSearch && (
          <div>
            <Row gutter={6}>
              <Col md={8} xs={24}>
                <Field
                  id="email"
                  name="email"
                  placeholder="Contact Email"
                  component={renderConfig.FIELD}
                />
              </Col>
              <Col md={8} xs={24}>
                <Field
                  id="phone"
                  name="phone"
                  placeholder="Phone Number"
                  component={renderConfig.FIELD}
                />
              </Col>
              <Col md={8} xs={24}>
                <Field
                  id="role"
                  name="role"
                  component={renderConfig.SELECT}
                  // TODO: fetch roles and set here as props
                  data={[
                    { value: "", label: "All Roles" },
                    { value: "PMT", label: "Permittee" },
                    { value: "MMG", label: "Mine Manager" },
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

AdvancedContactSearchForm.propTypes = propTypes;
AdvancedContactSearchForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADVANCE_SEARCH,
  touchOnBlur: false,
})(AdvancedContactSearchForm);
