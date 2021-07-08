/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import { Field, reduxForm, change, formValueSelector, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, Alert } from "antd";
import { getNoticeOfWorkList } from "@common/selectors/noticeOfWorkSelectors";
import {
  required,
  maxLength,
  dateNotInFuture,
  number,
  lat,
  lon,
  requiredRadioButton,
} from "@common/utils/Validate";
import { resetForm, createDropDownList } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import ExplosivesPermitMap from "@/components/maps/ExplosivesPermitMap";
import { getPermits } from "@common/selectors/permitSelectors";
import DocumentCategoryForm from "@/components/Forms/DocumentCategoryForm";
import MagazineForm from "@/components/Forms/ExplosivesPermit/MagazineForm";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  mineGuid: PropTypes.string.isRequired,
  permit_guid: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  change: PropTypes.func,
  isApproved: PropTypes.bool,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.importedNOWApplication).isRequired,
};

const defaultProps = {
  initialValues: {},
  change,
  isApproved: false,
};

const closedOptions = [
  {
    value: false,
    label: "Open",
  },
  {
    value: true,
    label: "Closed",
  },
];

export class ExplosivesPermitForm extends Component {
  render() {
    const permitDropdown = createDropDownList(this.props.permits, "permit_no", "permit_guid");
    const nowDropdown = createDropDownList(
      this.props.noticeOfWorkApplications,
      "now_number",
      "now_application_guid"
    );

    const isHistoric = !this.props.initialValues?.explosives_permit_id && this.props.isPermitTab;
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        {isHistoric && (
          <Alert
            message="Adding a Historic Explosives Storage & Use Permit"
            description="By creating an Explosives Permit on the Permit Tab, the permit will be created with a status of Approved and an Originating System of MMS. If you would like to create an Explosives Permit Application, navigate to the Application Tab."
            type="info"
            showIcon
          />
        )}
        <br />
        <Row gutter={48}>
          <Col md={12} sm={24}>
            <h4>Explosives Permit Details</h4>
            {this.props.isPermitTab && (
              <>
                <Row gutter={6}>
                  <Col span={12}>
                    <Form.Item>
                      <Field
                        id="issue_date"
                        name="issue_date"
                        label="Issue Date*"
                        component={renderConfig.DATE}
                        validate={[required, dateNotInFuture]}
                        disabled={this.props.isApproved}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item>
                      <Field
                        id="expiry_date"
                        name="expiry_date"
                        label="Expiry Date*"
                        component={renderConfig.DATE}
                        validate={[required]}
                        disabled={this.props.isApproved}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col span={12}>
                    <Form.Item>
                      <PartySelectField
                        id="mine_operator_party_guid"
                        name="mine_operator_party_guid"
                        label="Mine Operator*"
                        placeholder="Start typing the Mine Operator's name"
                        partyLabel="Mine Operator"
                        validate={[required]}
                        allowAddingParties
                        disabled={this.props.isApproved}
                        initialValues={this.props.initialMineOperatorValue}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item>
                      <Field
                        id="issuing_inspector_party_guid"
                        name="issuing_inspector_party_guid"
                        label="Issuing Inspector*"
                        component={renderConfig.GROUPED_SELECT}
                        placeholder="Start typing the Issuing Inspector's name"
                        validate={[required]}
                        data={this.props.inspectors}
                        disabled={this.props.isApproved}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
            <Row gutter={6}>
              {this.props.isPermitTab && (
                <Col span={12}>
                  <Form.Item>
                    <Field
                      id="permit_number"
                      name="permit_number"
                      placeholder="Explosives Permit Number"
                      label="Explosives Permit Number*"
                      component={renderConfig.FIELD}
                      validate={[required]}
                      disabled={this.props.isApproved}
                    />
                  </Form.Item>
                </Col>
              )}
              <Col span={this.props.isPermitTab ? 12 : 24}>
                <Form.Item>
                  <Field
                    id="permit_guid"
                    name="permit_guid"
                    placeholder="Select a Permit"
                    label="Mines Act Permit*"
                    component={renderConfig.SELECT}
                    data={permitDropdown}
                    validate={[required]}
                    disabled={this.props.isApproved}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Field
                id="now_application_guid"
                name="now_application_guid"
                placeholder="Select a NoW"
                label="Notice of Work Number"
                component={renderConfig.SELECT}
                data={nowDropdown}
                disabled={this.props.isApproved}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="application_date"
                name="application_date"
                label="Application Date*"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
                disabled={this.props.isApproved}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="description"
                name="description"
                label="Other Information"
                component={renderConfig.AUTO_SIZE_FIELD}
                disabled={this.props.isApproved}
              />
            </Form.Item>
            <h4>Storage Details</h4>
            <Row gutter={6}>
              <Col span={12}>
                <Form.Item>
                  <Field
                    id="latitude"
                    name="latitude"
                    label="Latitude*"
                    validate={[number, maxLength(10), lat, required]}
                    component={renderConfig.FIELD}
                    disabled={this.props.isApproved}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item>
                  <Field
                    id="longitude"
                    name="longitude"
                    label="Longitude*"
                    validate={[number, maxLength(12), lon, required]}
                    component={renderConfig.FIELD}
                    disabled={this.props.isApproved}
                  />
                </Form.Item>
              </Col>
            </Row>
            <ExplosivesPermitMap
              pin={[this.props.formValues?.latitude, this.props.formValues?.longitude]}
            />
            <br />
            <DocumentCategoryForm
              categories={this.props.documentTypeDropdownOptions}
              mineGuid={this.props.mineGuid}
              isApproved={this.props.isApproved}
            />
          </Col>
          <Col md={12} sm={24} className="border--left--layout">
            {isHistoric && (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item>
                      <Field
                        id="is_closed"
                        name="is_closed"
                        label="Permit Status*"
                        component={renderConfig.RADIO}
                        customOptions={closedOptions}
                        validate={[requiredRadioButton]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item>
                      <Field
                        id="closed_timestamp"
                        name="closed_timestamp"
                        label="Date Permit was Closed"
                        component={renderConfig.DATE}
                        disabled={this.props.isApproved}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item>
                      <Field
                        id="closed_reason"
                        name="closed_reason"
                        label="Reason for Closure"
                        component={renderConfig.AUTO_SIZE_FIELD}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
            <br />
            <MagazineForm isApproved={this.props.isApproved} />
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
            type="primary"
            className="full-mobile"
            htmlType="submit"
            loading={this.props.submitting}
          >
            Submit
          </Button>
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
  documents: selector(state, "documents"),
  formValues: getFormValues(FORM.EXPLOSIVES_PERMIT)(state),
  noticeOfWorkApplications: getNoticeOfWorkList(state),
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
