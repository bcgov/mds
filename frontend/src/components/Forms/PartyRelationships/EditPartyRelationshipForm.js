import React from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { Field, reduxForm } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { resetForm } from "@/utils/helpers";
import { validateDateRanges } from "@/utils/Validate";
import EngineerOfRecordOptions from "@/components/Forms/PartyRelationships/EngineerOfRecordOptions";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  // Props are used indirectly. Linting is unable to detect it
  // eslint-disable-next-line react/no-unused-prop-types
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  partyRelationshipType: CustomPropTypes.partyRelationshipType.isRequired,
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  mine: CustomPropTypes.mine,
  submitting: PropTypes.bool.isRequired,
};

const defaultProps = {
  mine: {},
};

const checkDatesForOverlap = (values, props) => {
  const existingAppointments = props.partyRelationships.filter(
    ({ mine_party_appt_type_code, mine_party_appt_guid }) =>
      mine_party_appt_type_code === values.mine_party_appt_type_code &&
      mine_party_appt_guid !== values.mine_party_appt_guid
  );

  return validateDateRanges(existingAppointments, values, props.partyRelationshipType.description);
};

const validate = (values, props) => {
  const errors = {};
  if (values.start_date && values.end_date) {
    if (Date.parse(values.start_date) > Date.parse(values.end_date)) {
      errors.end_date = "Must be after start date.";
    }
  }

  if (isEmpty(errors)) {
    const { start_date, end_date } = checkDatesForOverlap(values, props);
    errors.start_date = start_date;
    errors.end_date = end_date;
  }

  return errors;
};

export const EditPartyRelationshipForm = (props) => {
  let options;
  switch (props.partyRelationship.mine_party_appt_type_code) {
    case "EOR":
      options = <EngineerOfRecordOptions mine={props.mine} />;
      break;
    default:
      options = <div />;
      break;
  }

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
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
      {options}
      <div className="right center-mobile">
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
        <Button
          className="full-mobile"
          type="primary"
          htmlType="submit"
          disabled={props.submitting}
        >
          {props.title}
        </Button>
      </div>
    </Form>
  );
};

EditPartyRelationshipForm.propTypes = propTypes;
EditPartyRelationshipForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.EDIT_PARTY_RELATIONSHIP,
  validate,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.EDIT_PARTY_RELATIONSHIP),
})(EditPartyRelationshipForm);
