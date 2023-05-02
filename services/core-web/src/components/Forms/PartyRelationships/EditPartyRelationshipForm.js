import React from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { resetForm } from "@common/utils/helpers";
import { validateDateRanges } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import TSFOptions from "@/components/Forms/PartyRelationships/TSFOptions";
import UnionRepOptions from "@/components/Forms/PartyRelationships/UnionRepOptions";
import { PermitteeOptions } from "@/components/Forms/PartyRelationships/PermitteeOptions";
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
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {
  mine: {},
};

// returns validation errors to be displayed to the user.
const checkDatesForOverlap = (values, props) => {
  const existingAppointments = props.partyRelationships.filter(
    ({ mine_party_appt_type_code, related_guid, mine_party_appt_guid }) => {
      const match =
        mine_party_appt_type_code === props.partyRelationshipType.mine_party_appt_type_code &&
        mine_party_appt_guid !== values.mine_party_appt_guid;
      if (related_guid !== "") {
        return match && values.related_guid === related_guid;
      }
      return match;
    }
  );

  if (values && ["MMG", "PMT"].includes(values.mine_party_appt_type_code)) {
    return validateDateRanges(
      existingAppointments,
      values,
      props.partyRelationshipType.description,
      false
    );
  }

  return {};
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
  const isRelatedGuidSet = !!props.partyRelationship.related_guid;
  switch (props.partyRelationship.mine_party_appt_type_code) {
    case "TQP":
    case "EOR":
      options = <TSFOptions mine={props.mine} />;
      break;
    case "URP":
      options = <UnionRepOptions />;
      break;
    case "THD":
    case "LDO":
    case "MOR":
      options = (
        <PermitteeOptions
          minePermits={props.minePermits}
          isPermitRequired={isRelatedGuidSet}
          isPermitDropDownDisabled={isRelatedGuidSet}
        />
      );
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
          disabled={props.submitting}
        >
          <Button className="full-mobile" type="secondary" disabled={props.submitting}>
            Cancel
          </Button>
        </Popconfirm>
        <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
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
