import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm, Collapse } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";

const { Panel } = Collapse;

const propTypes = {
  cancelGeneration: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isAmendment: PropTypes.bool.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

export const GeneratePermitForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <ScrollContentWrapper id="general-info" title="General Information">
      <>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Field
              id="mine_no"
              name="mine_no"
              label="Mine Number"
              required
              component={renderConfig.FIELD}
              validate={[required]}
              disabled
            />
          </Col>
          <Col xs={24} md={12}>
            <Field
              id="permit_number"
              name="permit_number"
              label="Permit Number"
              required
              component={renderConfig.FIELD}
              validate={[required]}
            />
          </Col>
        </Row>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Field
              id="permittee"
              name="permittee"
              label="Permitee"
              required
              component={renderConfig.FIELD}
              validate={[required]}
              disabled
            />
          </Col>
          <Col xs={24} md={12}>
            <Field
              id="permittee_mailing_address"
              name="permittee_mailing_address"
              label="Permitee Mailing address"
              required
              component={renderConfig.AUTO_SIZE_FIELD}
              validate={[required]}
              disabled
            />
          </Col>
        </Row>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Field
              id="permittee_email"
              name="permittee_email"
              label="Permitee Email"
              required
              component={renderConfig.FIELD}
              validate={[required]}
              disabled
            />
          </Col>
          <Col xs={24} md={12}>
            <Field
              id="mine_location"
              name="mine_location"
              label="Mine Location"
              required
              component={renderConfig.FIELD}
              validate={[required]}
              disabled
            />
          </Col>
        </Row>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Field
              id="issue_date"
              name="issue_date"
              label="Issue Date"
              required
              component={renderConfig.DATE}
              validate={[required]}
              disabled
            />
          </Col>
          <Col xs={24} md={12}>
            <Field
              id="auth_end_date"
              name="auth_end_date"
              label="Authorization End Date"
              required
              component={renderConfig.DATE}
              validate={[required]}
            />
          </Col>
        </Row>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Field
              id="lead_inspector"
              name="lead_inspector"
              label="Lead Inspector Name"
              required
              component={renderConfig.FIELD}
              validate={[required]}
              disabled
            />
          </Col>
          <Col xs={24} md={12}>
            <Field
              id="lead_inspector_title"
              name="lead_inspector_title"
              label="Lead Inspector Title"
              required
              component={renderConfig.FIELD}
              validate={[required]}
            />
          </Col>
        </Row>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Field
              id="regional_office"
              name="regional_office"
              label="Regional Office"
              required
              component={renderConfig.FIELD}
              validate={[required]}
            />
          </Col>
          {props.isAmendment && (
            <Col xs={24} md={12}>
              <Field
                id="original_permit_issue_date"
                name="original_permit_issue_date"
                label="Original Permit Issue Date"
                required
                component={renderConfig.DATE}
                validate={[required]}
              />
            </Col>
          )}
        </Row>
      </>
    </ScrollContentWrapper>
    <ScrollContentWrapper id="preamble" title="Preamble">
      <>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Field
              id="application_date"
              name="application_date"
              label="Application Date"
              required
              component={renderConfig.FIELD}
              validate={[required]}
              disabled
            />
          </Col>
          <Col xs={24} md={12}>
            <Field
              id="property"
              name="property"
              label="Property Name"
              required
              component={renderConfig.FIELD}
              validate={[required]}
              disabled
            />
          </Col>
        </Row>
        <Row gutter={32}>
          {/* <Col xs={24} md={12}>
            <Field
              id="application_date"
              name="application_date"
              label="Application Date"
              required
              component={renderConfig.FIELD}
              validate={[required]}
              disabled
            />
          </Col> */}
          <Col xs={24} md={12}>
            <Field
              id="application_type"
              name="application_type"
              label="Notice of Work Permit Type"
              required
              component={renderConfig.FIELD}
              validate={[required]}
              disabled
            />
          </Col>
        </Row>
        <br />
        <FinalPermitDocuments
          mineGuid={props.noticeOfWork.mine_guid}
          noticeOfWork={props.noticeOfWork}
        />
      </>
    </ScrollContentWrapper>
    <ScrollContentWrapper id="conditions" title="Conditions">
      <>
        <Collapse defaultActiveKey={["general"]}>
          <Panel header="A. General Conditions" key="general" id="general">
            <Row gutter={32}>
              <Col xs={24} md={12}>
                <Field
                  id="conditions"
                  name="conditions"
                  label="Conditions"
                  required
                  component={renderConfig.AUTO_SIZE_FIELD}
                  validate={[required]}
                />
              </Col>
            </Row>
          </Panel>
          <Panel header="B. Healthy and Safety Conditions" key="health-safety" id="health-safety">
            <p>No conditions</p>
          </Panel>
          <Panel header="C. Geotechnical Conditions" key="geotechnical" id="geotechnical">
            <p>No conditions</p>
          </Panel>
          <Panel
            header="D. Environmental Land and Watercourses Conditions"
            key="environmental-land"
            id="environmental-land"
          >
            <p>No conditions</p>
          </Panel>
          <Panel
            header="E. Reclamation and Closure Program Conditions"
            key="reclamation-closure"
            id="reclamation-closure"
          >
            <p>No conditions</p>
          </Panel>
          <Panel
            header="F. Additional Conditions"
            key="additional-conditions"
            id="additional-conditions"
          >
            <p>No conditions</p>
          </Panel>
        </Collapse>
      </>
    </ScrollContentWrapper>
    <div className="right center-mobile">
      <Popconfirm
        placement="topRight"
        onConfirm={() => props.cancelGeneration()}
        title="Are you sure you want to cancel?"
        okText="Yes"
        cancelText="No"
      >
        <Button className="full-mobile" type="secondary">
          Cancel
        </Button>
      </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit" disabled={props.submitting}>
        Generate
      </Button>
    </div>
  </Form>
);

GeneratePermitForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.GENERATE_PERMIT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.GENERATE_PERMIT),
})(GeneratePermitForm);
