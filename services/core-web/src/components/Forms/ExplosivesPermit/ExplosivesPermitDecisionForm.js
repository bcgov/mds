/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose } from "redux";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { getNoticeOfWorkList } from "@common/selectors/noticeOfWorkSelectors";
import { required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { getPermits } from "@common/selectors/permitSelectors";
import { getGenerateDocumentFormField } from "@/components/common/GenerateDocumentFormField";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  previewDocument: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  submitting: PropTypes.bool.isRequired,
  formValues: CustomPropTypes.explosivesPermit.isRequired,
  initialValues: CustomPropTypes.explosivesPermit.isRequired,
};

export class ExplosivesPermitDecisionForm extends Component {
  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col span={24}>
            <Form.Item>
              <Field
                id="issuing_inspector_party_guid"
                name="issuing_inspector_party_guid"
                label="Issuing Inspector*"
                component={renderConfig.GROUPED_SELECT}
                placeholder="Start typing the Issuing Inspector's name"
                validate={[required]}
                data={this.props.inspectors}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue Date*"
                component={renderConfig.DATE}
                validate={[required]}
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

            {this.props.documentType.document_template.form_spec
              .filter((field) => !field["read-only"])
              .map((field) => (
                <Form.Item key={field.id}>{getGenerateDocumentFormField(field)}</Form.Item>
              ))}
          </Col>
        </Row>
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
          <Button
            className="full-mobile"
            type="secondary"
            onClick={() => this.props.previewDocument("LET", this.props.formValues)}
          >
            Preview Letter
          </Button>
          <Button
            className="full-mobile"
            type="secondary"
            onClick={() => this.props.previewDocument("PER", this.props.formValues)}
          >
            Preview Permit Certificate
          </Button>
          <Button
            type="primary"
            className="full-mobile"
            htmlType="submit"
            // disabled={this.state.submitting}
          >
            Issue Permit
          </Button>
        </div>
      </Form>
    );
  }
}

ExplosivesPermitDecisionForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  permits: getPermits(state),
  noticeOfWorkApplications: getNoticeOfWorkList(state),
  formValues: getFormValues(FORM.EXPLOSIVES_PERMIT_DECISION)(state),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.EXPLOSIVES_PERMIT_DECISION,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT_DECISION),
  })
)(ExplosivesPermitDecisionForm);
