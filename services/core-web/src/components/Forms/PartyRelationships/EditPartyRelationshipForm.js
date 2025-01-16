import React from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import { validateDateRanges } from "@mds/common/redux/utils/Validate";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import TSFOptions from "@/components/Forms/PartyRelationships/TSFOptions";
import UnionRepOptions from "@/components/Forms/PartyRelationships/UnionRepOptions";
import { PermitteeOptions } from "@/components/Forms/PartyRelationships/PermitteeOptions";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  title: PropTypes.string.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship).isRequired,
  partyRelationshipType: CustomPropTypes.partyRelationshipType.isRequired,
  partyRelationship: CustomPropTypes.partyRelationship.isRequired,
  mine: CustomPropTypes.mine,
  minePermits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {
  mine: {},
};

export const EditPartyRelationshipForm = (props) => {

  // returns validation errors to be displayed to the user.
  const checkDatesForOverlap = (values) => {
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

  const validate = (values) => {
    const errors = {};
    if (values.start_date && values.end_date) {
      if (Date.parse(values.start_date) > Date.parse(values.end_date)) {
        errors.end_date = "Must be after start date.";
      }
    }

    if (isEmpty(errors)) {
      const { start_date, end_date } = checkDatesForOverlap(values);
      errors.start_date = start_date;
      errors.end_date = end_date;
    }

    return errors;
  };

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
    <FormWrapper
      initialValues={props.initialValues}
      isModal
      name={FORM.EDIT_PARTY_RELATIONSHIP}
      reduxFormConfig={{
        validate,
        touchOnBlur: false,
      }}
      onSubmit={props.onSubmit}>
      <Row gutter={16}>
        <Col md={12} xs={24}>
          <Field
            id="start_date"
            name="start_date"
            label="Start Date"
            placeholder="yyyy-mm-dd"
            component={renderConfig.DATE}
          />
        </Col>
        <Col md={12} xs={24}>
          <Field
            id="end_date"
            name="end_date"
            label="End Date"
            placeholder="yyyy-mm-dd"
            component={renderConfig.DATE}
          />
        </Col>
      </Row>
      {options}
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText={props.title} />
      </div>
    </FormWrapper>
  );
};

EditPartyRelationshipForm.propTypes = propTypes;
EditPartyRelationshipForm.defaultProps = defaultProps;

export default EditPartyRelationshipForm;
