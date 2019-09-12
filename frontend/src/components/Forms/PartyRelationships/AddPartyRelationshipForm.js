import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import moment from "moment";
import { isEmpty } from "lodash";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import { required, validateDateRanges } from "@/utils/Validate";
import { EngineerOfRecordOptions } from "@/components/Forms/PartyRelationships/EngineerOfRecordOptions";
import { PermitteeOptions } from "@/components/Forms/PartyRelationships/PermitteeOptions";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  partyRelationshipType: CustomPropTypes.partyRelationshipType.isRequired,
  related_guid: PropTypes.string,
  start_date: PropTypes.date,
  mine: CustomPropTypes.mine,
  submitting: PropTypes.bool.isRequired,
};

const defaultProps = {
  mine: {},
  related_guid: "",
  start_date: null,
};

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

const validate = (values, props) => {
  const errors = {};
  const minePartyApptTypeCode = props.partyRelationshipType.mine_party_appt_type_code;
  if (
    minePartyApptTypeCode === "PMT" ||
    minePartyApptTypeCode === "MMG" ||
    minePartyApptTypeCode === "EOR"
  ) {
    if (values.start_date && values.end_date) {
      if (moment(values.start_date) > moment(values.end_date)) {
        errors.end_date = "Must be after start date.";
      }
    }
    if (isEmpty(errors) && !values.end_current) {
      const { start_date, end_date } = checkDatesForOverlap(values, props);
      errors.start_date = start_date;
      errors.end_date = end_date ? " " : null;
    }
  }
  return errors;
};

const checkCurrentAppointmentValidation = (
  currentStartDate,
  partyRelationshipType,
  partyRelationships,
  currentRelatedGuid
) => {
  const minePartyApptTypeCode = partyRelationshipType.mine_party_appt_type_code;

  const existingEndedAppointments = partyRelationships.filter(
    ({ mine_party_appt_type_code, related_guid, end_date }) => {
      let match = mine_party_appt_type_code === minePartyApptTypeCode;
      if (related_guid !== "") {
        match = match && currentRelatedGuid === related_guid;
      }
      return match && end_date !== null;
    }
  );
  const currentAppointment = partyRelationships.filter(
    ({ mine_party_appt_type_code, related_guid, end_date }) => {
      let match = mine_party_appt_type_code === minePartyApptTypeCode;
      if (related_guid !== "") {
        match = match && currentRelatedGuid === related_guid;
      }
      return match && end_date === null;
    }
  );
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

export class AddPartyRelationshipForm extends Component {
  state = {
    skipDateValidation: false,
    currentAppointment: {},
  };

  componentWillReceiveProps = (nextProps) => {
    let passedValidation = false;
    let currentAppt;
    if (nextProps.start_date !== null) {
      if (
        ((nextProps.partyRelationshipType.mine_party_appt_type_code === "PMT" ||
          nextProps.partyRelationshipType.mine_party_appt_type_code === "EOR") &&
          nextProps.related_guid !== "") ||
        nextProps.partyRelationshipType.mine_party_appt_type_code === "MMG"
      ) {
        passedValidation = checkCurrentAppointmentValidation(
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
      if (passedValidation) {
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
      case "PMT":
        options = <PermitteeOptions mine={this.props.mine} />;
        break;
      default:
        options = <div />;
        break;
    }
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col md={24} xs={24}>
            <Form.Item>
              <PartySelectField
                id="party_guid"
                name="party_guid"
                validate={[required]}
                allowAddingParties
              />
            </Form.Item>
          </Col>
        </Row>
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
                    this.state.currentAppointment.party.name
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
          <Col md={12} xs={24}>
            {options}
          </Col>
        </Row>
        <div className="right center-mobile">
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
            type="primary"
            htmlType="submit"
            disabled={this.props.submitting}
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
