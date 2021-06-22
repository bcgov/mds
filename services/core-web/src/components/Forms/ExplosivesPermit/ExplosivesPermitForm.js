/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { remove } from "lodash";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import { Field, reduxForm, change, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, Steps } from "antd";
import {
  required,
  maxLength,
  dateNotInFuture,
  number,
  validateSelectOptions,
} from "@common/utils/Validate";
import { resetForm, currencyMask, createDropDownList } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import { getPermits } from "@common/selectors/permitSelectors";
import PermitAmendmentUploadedFilesList from "@/components/mine/Permit/PermitAmendmentUploadedFilesList";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";
import { securityNotRequiredReasonOptions } from "@/constants/NOWConditions";
import { USER_ROLES } from "@common/constants/environment";

const originalPermit = "OGP";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleRemovePermitAmendmentDocument: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  mine_guid: PropTypes.string.isRequired,
  permit_guid: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  change: PropTypes.func,
  is_historical_amendment: PropTypes.bool.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  securityNotRequired: PropTypes.bool.isRequired,
};

const defaultProps = {
  initialValues: {},
  change,
};

export class ExplosivesPermitForm extends Component {
  state = {
    relatedDocuments: this.props.initialValues.related_documents || [],
    uploadedFiles: [],
    current: 0,
  };

  // Attached files handlers
  // handleRemovePermitAmendmentDocument = (relatedDocuments, documentGuid) => {
  //   this.props.handleRemovePermitAmendmentDocument(
  //     this.props.permit_guid,
  //     this.props.initialValues.permit_amendment_guid,
  //     documentGuid
  //   );
  //   const newRelatedDocuments = relatedDocuments.filter(
  //     (doc) => doc.permit_amendment_document_guid !== documentGuid
  //   );
  //   this.setState({ relatedDocuments: newRelatedDocuments });
  // };

  // File upload handlers
  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ fileName, document_manager_guid });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  handleChange = (e) => {
    if (e.target.value) {
      this.props.change("security_not_required_reason", null);
    } else {
      this.props.change("liability_adjustment", null);
      this.props.change("security_received_date", null);
    }
  };

  renderStepOne = (permitDropdown) => {
    return (
      <Row gutter={48}>
        <Col md={12} sm={24}>
          <Row gutter={6}>
            <Col span={8}>
              <Form.Item>
                <Field
                  id="mine_no"
                  name="mine_no"
                  label="Mine Number"
                  component={renderConfig.FIELD}
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item>
                <Field
                  id="mine_name"
                  name="mine_name"
                  label="Mine Name"
                  component={renderConfig.FIELD}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <PartySelectField
              id="permittee_party_guid"
              name="permittee_party_guid"
              label="Mine Operator*"
              partyLabel="permittee"
              validate={[required]}
              allowAddingParties
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="permit_guid"
              name="permit_guid"
              placeholder="Select a Permit"
              label="Mines Act Permit*"
              component={renderConfig.SELECT}
              data={permitDropdown}
              validate={[required]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="now_guid"
              name="now_guid"
              placeholder="Select a NoW"
              label="Notice of Work number"
              component={renderConfig.SELECT}
              data={permitDropdown}
            />
          </Form.Item>
          <Form.Item>
            <PartySelectField
              id="permittee_party_guid"
              name="permittee_party_guid"
              label="Issuing Inspector*"
              partyLabel="permittee"
              validate={[required]}
              allowAddingParties
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="application_date"
              name="application_date"
              label="Application Date*"
              component={renderConfig.DATE}
              validate={[required, dateNotInFuture]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="letter_body"
              name="letter_body"
              label="Letter Body*"
              component={renderConfig.AUTO_SIZE_FIELD}
            />
          </Form.Item>
        </Col>
        <Col md={12} sm={24} className="border--left--layout">
          <Form.Item label="Select Files/Upload files*">
            <Field
              id="PermitDocumentFileUpload"
              name="PermitDocumentFileUpload"
              onFileLoad={this.onFileLoad}
              onRemoveFile={this.onRemoveFile}
              mineGuid={this.props.mine_guid}
              component={PermitAmendmentFileUpload}
              allowMultiple
            />
          </Form.Item>
        </Col>
      </Row>
    );
  };

  renderStepTwo = () => {
    return (
      <Row gutter={48}>
        <Col md={12} sm={24}>
          <Form.Item label="Explosive Magazines" />
          <Form.Item>
            <Field
              id="total_exp_quantity"
              name="total_exp_quantity"
              label="Total Maximum Quantity"
              component={renderConfig.FIELD}
            />
          </Form.Item>
          <Form.Item label="Detonator Magazines" />
          <Form.Item>
            <Field
              id="total_det_quantity"
              name="total_det_quantity"
              label="Total Maximum Quantity"
              component={renderConfig.FIELD}
            />
          </Form.Item>
        </Col>
        <Col md={12} sm={24} className="border--left--layout">
          <Row gutter={6}>
            <Col span={12}>
              <Form.Item>
                <Field
                  id="latitude"
                  name="latitude"
                  label="Latitude*"
                  component={renderConfig.FIELD}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item>
                <Field
                  id="longitude"
                  name="longitude"
                  label="Longitude*"
                  component={renderConfig.FIELD}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Field
              id="issue_date"
              name="issue_date"
              label="Issue Date*"
              component={renderConfig.DATE}
              validate={[required, dateNotInFuture]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="expiry_date"
              name="expiry_date"
              label="Expiry Date*"
              component={renderConfig.DATE}
              validate={[required]}
            />
          </Form.Item>
        </Col>
      </Row>
    );
  };

  next() {
    this.setState((prevState) => ({ current: prevState.current + 1 }));
  }

  prev() {
    this.setState((prevState) => ({ current: prevState.current - 1 }));
  }

  render() {
    const permitDropdown = createDropDownList(this.props.permits, "permit_no", "permit_guid");
    const steps = [
      {
        title: "Generate Letter",
        content: this.renderStepOne(permitDropdown),
      },
      {
        title: "Issue Permit Certificate",
        content: this.renderStepTwo(permitDropdown),
      },
    ];
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Steps current={this.state.current}>
          {steps.map((step) => (
            <Steps.Step key={step.title} title={step.title} />
          ))}
        </Steps>
        <br />
        <div>{steps[this.state.current].content}</div>
        <div className="right center-mobile" style={{ paddingTop: "14px" }}>
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile" type="secondary">
              Cancel
            </Button>
          </Popconfirm>
          {this.state.current > 0 && (
            <Button
              type="tertiary"
              className="full-mobile"
              onClick={() => this.prev()}
              disabled={this.state.submitting}
            >
              Previous
            </Button>
          )}
          {this.state.current < steps.length - 1 && (
            <Button type="primary" className="full-mobile" onClick={() => this.next()}>
              Next
            </Button>
          )}
          {this.state.current === steps.length - 1 && (
            <Button
              type="primary"
              className="full-mobile"
              htmlType="submit"
              // onClick={(event) => this.handlePartySubmit(event, false)}
              loading={this.state.submitting}
            >
              Submit
            </Button>
          )}
        </div>
      </Form>
    );
  }
}

ExplosivesPermitForm.propTypes = propTypes;
ExplosivesPermitForm.defaultProps = defaultProps;

const selector = formValueSelector(FORM.EXPLOSIVES_PERMIT);
const mapStateToProps = (state) => ({
  permits: getPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.EXPLOSIVES_PERMIT,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT),
  })
)(ExplosivesPermitForm);
