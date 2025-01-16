import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Button, Col, Row } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { yearNotInFuture } from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderResetButton from "@mds/common/components/forms/RenderResetButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  toggleAdvancedSearch: PropTypes.func.isRequired,
  handleReset: PropTypes.func.isRequired,
  isAdvanceSearch: PropTypes.bool,
  mineRegionOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  isAdvanceSearch: false,
};

export class IncidentSearchForm extends Component {
  handleReset = () => {
    this.props.handleReset();
  };

  render() {
    return (
      <FormWrapper
        initialValues={this.props.initialValues}
        name={FORM.INCIDENT_ADVANCED_SEARCH}
        reduxFormConfig={{
          touchOnBlur: false,
          enableReinitialize: true,
        }}
        onSubmit={this.props.onSubmit}
        onReset={this.handleReset}>
        <Row gutter={6}>
          <Col md={24} xs={24}>
            <Field
              id="search"
              name="search"
              component={renderConfig.FIELD}
              placeholder="Search by mine name or number"
            />
          </Col>
        </Row>
        {this.props.isAdvanceSearch && (
          <div>
            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="incident_status"
                  name="incident_status"
                  placeholder="Select Incident Status"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.incidentStatusCodeOptions}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="year"
                  name="year"
                  placeholder="Select Incident Year"
                  component={renderConfig.YEAR}
                  validate={[yearNotInFuture]}
                />
              </Col>
            </Row>

            <Row gutter={6}>
              <Col md={12} xs={24}>
                <Field
                  id="determination"
                  name="determination"
                  placeholder="Select Inspector's Determination"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.incidentDeterminationOptions}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="codes"
                  name="codes"
                  placeholder="Select Code Section"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.doSubparagraphOptions}
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
                  id="region"
                  name="region"
                  placeholder="Select Mine Region"
                  component={renderConfig.MULTI_SELECT}
                  data={this.props.mineRegionOptions}
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
          <RenderResetButton className="full-mobile" buttonText="Clear Filters" />
          <Button className="full-mobile" type="primary" htmlType="submit">
            Apply Filters
          </Button>
        </div>
      </FormWrapper>
    );
  }
}

IncidentSearchForm.propTypes = propTypes;
IncidentSearchForm.defaultProps = defaultProps;

export default IncidentSearchForm;
