import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import { Field, reduxForm, change, formValueSelector, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, Alert } from "antd";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common";
import { getNoticeOfWorkList } from "@common/selectors/noticeOfWorkSelectors";
import {
  required,
  maxLength,
  dateNotInFuture,
  number,
  lat,
  lon,
  requiredRadioButton,
  lonNegative,
} from "@common/utils/Validate";
import { resetForm, createDropDownList, formatDate } from "@common/utils/helpers";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import {
  getPartyRelationships,
  getAllPartyRelationships,
} from "@common/selectors/partiesSelectors";
import * as FORM from "@/constants/forms";
import ExplosivesPermitMap from "@/components/maps/ExplosivesPermitMap";
import { getPermits } from "@common/selectors/permitSelectors";
import DocumentCategoryForm from "@/components/Forms/DocumentCategoryForm";
import MagazineForm from "@/components/Forms/ExplosivesPermit/MagazineForm";
import * as Permission from "@/constants/permissions";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.string),
  mineGuid: PropTypes.string.isRequired,
  isProcessed: PropTypes.bool.isRequired,
  documentTypeDropdownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  isPermitTab: PropTypes.bool.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  submitting: PropTypes.bool.isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.importedNOWApplication).isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  formValues: CustomPropTypes.explosivesPermit.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  allPartyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  mines_permit_guid: PropTypes.string,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const defaultProps = {
  initialValues: {},
  mines_permit_guid: null,
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

const validateBusinessRules = (values) => {
  const errors = {};
  if (!values.mine_manager_mine_party_appt_id) {
    errors.mine_manager_mine_party_appt_id = "The Site must have a Mine Manager on record.";
  }
  if (!values.permittee_mine_party_appt_id) {
    errors.permittee_mine_party_appt_id = "The Permit must have a Permittee on record.";
  }
  return errors;
};

export const ExplosivesPermitForm = (props) => {
  const partiesData = props.isPermitTab ? props.allPartyRelationships : props.partyRelationships;
  const mineManagers = partiesData.filter(
    ({ mine_party_appt_type_code }) => mine_party_appt_type_code === "MMG"
  );
  const permittee = partiesData.filter(
    ({ mine_party_appt_type_code, related_guid }) =>
      mine_party_appt_type_code === "PMT" && related_guid === props.mines_permit_guid
  );

  const dropdown = (array) =>
    array.length > 0
      ? array.map((item) => {
          const endDate = formatDate(item.end_date) || "Present";
          return {
            value: item.mine_party_appt_id,
            label: `${item.party.name} (${formatDate(item.start_date)} - ${endDate})`,
          };
        })
      : [];
  const mineManagersDropdown = dropdown(mineManagers);
  const permitteeDropdown = dropdown(permittee);
  const permitDropdown = createDropDownList(props.permits, "permit_no", "permit_guid");
  const nowDropdown = createDropDownList(
    props.noticeOfWorkApplications,
    "now_number",
    "now_application_guid"
  );

  const isHistoric = !props.initialValues?.explosives_permit_id && props.isPermitTab;
  const isAdmin = props.userRoles.includes(USER_ROLES[Permission.ADMIN]);
  const disabled = props.isProcessed && !isAdmin;
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      {isHistoric && (
        <Alert
          message="Adding a Historic Explosives Storage & Use Permit"
          description="By creating an Explosives Permit on the Permit Tab, the permit will be created with a status of Approved and an Originating System of MMS. If you would like to create an Explosives Permit Application, navigate to the Application Tab."
          type="info"
          showIcon
        />
      )}
      {props.isProcessed && (
        <Alert
          message="Editing Disabled"
          description="If details of this permit need to be cleaned up for data quality purposes, contact the MDS administrators at mds@gov.bc.ca"
          type="info"
          showIcon
        />
      )}
      <br />
      <Row gutter={48}>
        <Col md={12} sm={24}>
          <h4>Explosives Permit Details</h4>
          {props.isPermitTab && (
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
                      disabled={disabled}
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
                      disabled={disabled}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={6}>
                <Col span={24}>
                  <Form.Item>
                    <Field
                      id="issuing_inspector_party_guid"
                      name="issuing_inspector_party_guid"
                      label="Issuing Inspector*"
                      component={renderConfig.GROUPED_SELECT}
                      placeholder="Start typing the Issuing Inspector's name"
                      validate={[required]}
                      data={props.inspectors}
                      disabled={disabled}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
          <Row gutter={6}>
            {props.isPermitTab && (
              <Col span={12}>
                <Form.Item>
                  <Field
                    id="permit_number"
                    name="permit_number"
                    placeholder="Explosives Permit Number"
                    label="Explosives Permit Number*"
                    component={renderConfig.FIELD}
                    validate={[required]}
                    disabled={disabled}
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={props.isPermitTab ? 12 : 24}>
              <Form.Item>
                <Field
                  id="permit_guid"
                  name="permit_guid"
                  placeholder="Select a Permit"
                  label="Mines Act Permit*"
                  component={renderConfig.SELECT}
                  data={permitDropdown}
                  validate={[required]}
                  disabled={disabled}
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
              disabled={disabled}
            />
          </Form.Item>
          <Row gutter={6}>
            <Col span={12}>
              <Form.Item>
                <Field
                  id="mine_manager_mine_party_appt_id"
                  name="mine_manager_mine_party_appt_id"
                  label={props.isPermitTab ? "Mine Manager" : "Mine Manager*"}
                  placeholder="Select Mine Manager"
                  partyLabel="Mine Manager"
                  validate={props.isPermitTab ? [] : [required]}
                  component={renderConfig.SELECT}
                  data={mineManagersDropdown}
                  disabled={disabled}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item>
                <Field
                  id="permittee_mine_party_appt_id"
                  name="permittee_mine_party_appt_id"
                  label="Permittee*"
                  component={renderConfig.SELECT}
                  placeholder="Select Permittee"
                  validate={[required]}
                  data={permitteeDropdown}
                  disabled={disabled || !props.mines_permit_guid}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Field
              id="application_date"
              name="application_date"
              label="Application Date*"
              component={renderConfig.DATE}
              validate={[required, dateNotInFuture]}
              disabled={disabled}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="description"
              name="description"
              label="Other Information"
              component={renderConfig.AUTO_SIZE_FIELD}
              disabled={disabled}
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
                  disabled={disabled}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item>
                <Field
                  id="longitude"
                  name="longitude"
                  label="Longitude*"
                  validate={[number, maxLength(12), lon, required, lonNegative]}
                  component={renderConfig.FIELD}
                  disabled={disabled}
                />
              </Form.Item>
            </Col>
          </Row>
          <ExplosivesPermitMap pin={[props.formValues?.latitude, props.formValues?.longitude]} />
          <br />
          <DocumentCategoryForm
            categories={props.documentTypeDropdownOptions}
            mineGuid={props.mineGuid}
            isProcessed={disabled}
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
                      disabled={disabled}
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
          <MagazineForm isProcessed={disabled} />
        </Col>
      </Row>
      <div className="right center-mobile" style={{ paddingTop: "14px" }}>
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
          okText="Yes"
          cancelText="No"
        >
          <Button className="full-mobile" type="secondary">
            Cancel
          </Button>
        </Popconfirm>
        <Button type="primary" className="full-mobile" htmlType="submit" loading={props.submitting}>
          Submit
        </Button>
      </div>
    </Form>
  );
};

ExplosivesPermitForm.propTypes = propTypes;
ExplosivesPermitForm.defaultProps = defaultProps;

const selector = formValueSelector(FORM.EXPLOSIVES_PERMIT);
const mapStateToProps = (state) => ({
  permits: getPermits(state),
  documents: selector(state, "documents"),
  mines_permit_guid: selector(state, "permit_guid"),
  formValues: getFormValues(FORM.EXPLOSIVES_PERMIT)(state),
  partyRelationships: getPartyRelationships(state),
  allPartyRelationships: getAllPartyRelationships(state),
  noticeOfWorkApplications: getNoticeOfWorkList(state),
  userRoles: getUserAccessData(state),
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
    validate: validateBusinessRules,
    onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT),
  })
)(ExplosivesPermitForm);
