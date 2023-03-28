import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import moment from "moment";
import { isEmpty } from "lodash";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { required, validateDateRanges } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import { EngineerOfRecordOptions } from "@/components/Forms/PartyRelationships/EngineerOfRecordOptions";
import { UnionRepOptions } from "@/components/Forms/PartyRelationships/UnionRepOptions";
import { PermitteeOptions } from "@/components/Forms/PartyRelationships/PermitteeOptions";
import CustomPropTypes from "@/customPropTypes";
import PartyRelationshipFileUpload from "./PartyRelationshipFileUpload";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  partyRelationshipType: CustomPropTypes.partyRelationshipType.isRequired,
  related_guid: PropTypes.string,
  start_date: PropTypes.date,
  mine: CustomPropTypes.mine,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  submitting: PropTypes.bool.isRequired,
  createPartyOnly: PropTypes.bool,
};

const defaultProps = {
  mine: {},
  related_guid: "",
  start_date: null,
  createPartyOnly: false,
};

const minePartyApptToValidate = ["PMT", "EOR", "MMG"];

// This function checks to make sure that the proposed new appointment only violates
// the current un-ended appointment. Only returns true or false no error messages.
const checkCurrentAppointmentValidation = (
  currentStartDate,
  partyRelationshipType,
  partyRelationships,
  currentRelatedGuid
) => {
  const minePartyApptTypeCode = partyRelationshipType.mine_party_appt_type_code;

  const appointments = partyRelationships.filter(({ mine_party_appt_type_code, related_guid }) => {
    let match = mine_party_appt_type_code === minePartyApptTypeCode;
    if (related_guid !== "") {
      match = match && currentRelatedGuid === related_guid;
    }
    return match;
  });

  const existingEndedAppointments = appointments.filter(({ end_date }) => end_date !== null);

  const currentAppointment = appointments.filter(({ end_date }) => end_date === null);

  const newAppt = { start_date: currentStartDate, end_date: null };

  const errors = validateDateRanges(
    existingEndedAppointments,
    newAppt,
    partyRelationshipType.description,
    false
  );
  if (isEmpty(errors) && currentAppointment.length > 0) {
    const currentErrors = validateDateRanges(
      currentAppointment,
      newAppt,
      partyRelationshipType.description,
      true
    );
    if (isEmpty(currentErrors)) {
      return true;
    }
  }
  return false;
};

// returns validation errors to be displayed to the user.
const checkDatesForOverlap = (values, props) => {
  const existingAppointments = props.partyRelationships.filter(
    ({ mine_party_appt_type_code, related_guid }) => {
      const match =
        mine_party_appt_type_code === props.partyRelationshipType.mine_party_appt_type_code;
      if (related_guid !== "") {
        return match && values.related_guid === related_guid;
      }
      return match;
    }
  );
  const newAppt = { start_date: null, end_date: null, ...values };

  return validateDateRanges(
    existingAppointments,
    newAppt,
    props.partyRelationshipType.description,
    false
  );
};

// Validate function that gets called on every touch of the form. This is ignored if the only error is that
// appointment interferes with the current and the user has decided to end that appointment.
const validate = (values, props) => {
  const errors = {};
  const minePartyApptTypeCode = props.partyRelationshipType.mine_party_appt_type_code;
  if (minePartyApptToValidate.includes(minePartyApptTypeCode)) {
    if (values.start_date && values.end_date) {
      if (moment(values.start_date) > moment(values.end_date)) {
        errors.end_date = "Must be after start date.";
      }
    }
    if (isEmpty(errors) && !values.end_current) {
      const { start_date, end_date } = checkDatesForOverlap(values, props);
      if (
        start_date &&
        !checkCurrentAppointmentValidation(
          values.start_date,
          props.partyRelationshipType,
          props.partyRelationships,
          props.related_guid
        )
      ) {
        errors.start_date = `${start_date}. You cannot have two appointments with overlapping dates.`;
      } else {
        errors.start_date = start_date;
      }
      errors.end_date = end_date ? " " : null;
    }
  }
  return errors;
};

export class AddPartyRelationshipForm extends Component {
  state = {
    skipDateValidation: false,
    currentAppointment: {},
    selectedParty: null,
  };

  // When the start_date and/or the related_guid are changed this checks to see if the the only appointment
  // it violates is the current one. A state variable is set that toggles a check box if it only violates the current appointment.
  componentWillReceiveProps = (nextProps) => {
    let toggleEndCurrentAppointment = false;
    let currentAppt;
    if (nextProps.start_date !== null) {
      if (
        ((nextProps.partyRelationshipType.mine_party_appt_type_code === "PMT" ||
          nextProps.partyRelationshipType.mine_party_appt_type_code === "EOR") &&
          nextProps.related_guid !== "") ||
        nextProps.partyRelationshipType.mine_party_appt_type_code === "MMG"
      ) {
        toggleEndCurrentAppointment = checkCurrentAppointmentValidation(
          nextProps.start_date,
          nextProps.partyRelationshipType,
          nextProps.partyRelationships,
          nextProps.related_guid
        );
        currentAppt = nextProps.partyRelationships.filter(
          ({ mine_party_appt_type_code, related_guid, end_date }) => {
            let match =
              mine_party_appt_type_code ===
              nextProps.partyRelationshipType.mine_party_appt_type_code;
            if (related_guid !== "") {
              match = match && nextProps.related_guid === related_guid;
            }
            return match && end_date === null;
          }
        );
      }
      if (toggleEndCurrentAppointment) {
        this.setState({ skipDateValidation: true });
        if (currentAppt && currentAppt.length === 1) {
          this.setState({ currentAppointment: currentAppt[0] });
        }
      } else {
        this.setState({ skipDateValidation: false });
      }
    }
  };

  render() {
    let options;
    switch (this.props.partyRelationshipType.mine_party_appt_type_code) {
      case "EOR":
        options = <EngineerOfRecordOptions mine={this.props.mine} />;
        break;
      case "URP":
        options = <UnionRepOptions />;
        break;
      case "PMT":
      case "THD":
      case "LDO":
      case "MOR":
        options = <PermitteeOptions minePermits={this.props.minePermits} />;
        break;
      default:
        options = <div />;
        break;
    }

    const handleSubmit = (evt) => {
      if (this.props.createPartyOnly) {
        // Override redux-form submit to allow submitting the selected party
        // instead of the form values
        evt.preventDefault();
        this.props.onSubmit(this.state.selectedParty);
      } else {
        // Let redux-form handle submission
        this.props.handleSubmit(evt);
      }
    };

    return (
      <Form layout="vertical" onSubmit={handleSubmit}>
        <Row gutter={16}>
          <Col md={24} xs={24}>
            <Form.Item>
              <PartySelectField
                id="party_guid"
                name="party_guid"
                validate={[required]}
                onSelect={(val) => {
                  this.setState({ selectedParty: val.originalValue });
                }}
                allowAddingParties
              />
            </Form.Item>
          </Col>
        </Row>

        {!this.props.createPartyOnly && (
          <>
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="start_date"
                    name="start_date"
                    label="Start Date"
                    placeholder="yyyy-mm-dd"
                    component={renderConfig.DATE}
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="end_date"
                    name="end_date"
                    label="End Date"
                    placeholder="yyyy-mm-dd"
                    component={renderConfig.DATE}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col md={12} xs={24}>
                {this.state.skipDateValidation && (
                  <Form.Item>
                    <Field
                      id="end_current"
                      name="end_current"
                      label={`Would you like to set the end date of ${
                        this.state.currentAppointment?.party?.name
                      } to ${moment(this.props.start_date)
                        .subtract(1, "days")
                        .format("MMMM Do YYYY")}`}
                      type="checkbox"
                      component={renderConfig.CHECKBOX}
                    />
                  </Form.Item>
                )}
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                {options}
                {this.props.partyRelationshipType.mine_party_appt_type_code === "MMG" && (
                  <div>
                    <h4>Mine Manager Appointment Letter</h4>
                    <Form.Item>
                      <Field
                        id="PartyRelationshipFileUpload"
                        name="PartyRelationshipFileUpload"
                        onFileLoad={this.props.onFileLoad}
                        onRemoveFile={this.props.onRemoveFile}
                        mineGuid={this.props.mine.mine_guid}
                        component={PartyRelationshipFileUpload}
                      />
                    </Form.Item>
                  </div>
                )}
              </Col>
            </Row>
          </>
        )}
        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
            disabled={this.props.submitting}
          >
            <Button className="full-mobile" type="secondary" disabled={this.props.submitting}>
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            loading={this.props.submitting}
          >
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

AddPartyRelationshipForm.propTypes = propTypes;
AddPartyRelationshipForm.defaultProps = defaultProps;
const selector = formValueSelector(FORM.ADD_PARTY_RELATIONSHIP);

export default compose(
  connect((state) => ({
    related_guid: selector(state, "related_guid"),
    start_date: selector(state, "start_date"),
  })),
  reduxForm({
    form: FORM.ADD_PARTY_RELATIONSHIP,
    validate,
    touchOnBlur: false,
  })
)(AddPartyRelationshipForm);
