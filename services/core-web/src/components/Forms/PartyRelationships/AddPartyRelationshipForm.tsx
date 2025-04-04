import React, { FC, useState } from "react";
import moment from "moment";
import { isEmpty } from "lodash";
import { Field, getFormValues } from "@mds/common/components/forms/form";
import { Col, Row } from "antd";
import { required, validateDateRanges } from "@mds/common/redux/utils/Validate";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import { FORM } from "@mds/common/constants/forms";
import { TSFOptions } from "@/components/Forms/PartyRelationships/TSFOptions";
import { UnionRepOptions } from "@/components/Forms/PartyRelationships/UnionRepOptions";
import { PermitteeOptions } from "@/components/Forms/PartyRelationships/PermitteeOptions";
import PartyRelationshipFileUpload from "./PartyRelationshipFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { IMine, IMinePartyAppt, IParty, IPermit } from "@mds/common/interfaces";
import { useAppSelector } from "@mds/common/redux/rootState";
import { getPartyRelationshipTypeHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { getMatchingPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";
import { MinePartyAppointmentTypeCodeEnum } from "@mds/common/constants/enums";

interface IPartyRelationshipPayload extends IMinePartyAppt, IParty { };

export interface AddPartyRelationshipFormProps {
  onSubmit: (values: IPartyRelationshipPayload) => void | Promise<void>;
  onFileLoad?: (documentName: string, document_manager_guid: string) => void;
  onRemoveFile?: (err: any, fileItem: any) => void;
  title: string;
  mine_party_appt_type_code: MinePartyAppointmentTypeCodeEnum;
  mine: IMine
  minePermits: IPermit[];
  createPartyOnly?: boolean;
}

const minePartyApptToValidate = ["PMT", "EOR", "MMG"];

// This function checks to make sure that the proposed new appointment only violates
// the current un-ended appointment. Only returns true or false no error messages.
const checkCurrentAppointmentValidation = (
  currentStartDate,
  appt_description,
  appointments,
) => {

  const existingEndedAppointments = appointments.filter(({ end_date }) => end_date !== null);

  const currentAppointments = appointments.filter(({ end_date }) => end_date === null);

  const newAppt = { start_date: currentStartDate, end_date: null };

  const errors = validateDateRanges(
    existingEndedAppointments,
    newAppt,
    appt_description,
    false
  );
  if (isEmpty(errors) && currentAppointments.length > 0) {
    const currentErrors = validateDateRanges(
      currentAppointments,
      newAppt,
      appt_description,
      true
    );
    if (isEmpty(currentErrors)) {
      return true;
    }
  }
  return false;
};

const AddPartyRelationshipForm: FC<AddPartyRelationshipFormProps> = ({
  onSubmit,
  onFileLoad,
  onRemoveFile,
  title,
  mine_party_appt_type_code,
  mine,
  minePermits,
  createPartyOnly = false,
}) => {

  const formValues = useAppSelector(getFormValues(FORM.ADD_PARTY_RELATIONSHIP)) as IMinePartyAppt;
  const { related_guid = "", start_date } = formValues ?? {};
  const [selectedParty, setSelectedParty] = useState<IParty>(null);
  const partyRelationshipTypeHash = useAppSelector(getPartyRelationshipTypeHash);
  const partyRelationshipDescription = partyRelationshipTypeHash[mine_party_appt_type_code];
  const matchingAppointments = useAppSelector(getMatchingPartyRelationships(mine_party_appt_type_code, related_guid));
  const currentAppointment = matchingAppointments.filter((mpa) => mpa.end_date === null)[0];
  const personOnly = ["EOR","TQP"].includes(mine_party_appt_type_code);

  const showEndCurrent = () => {
    const hasStartDateValidation = ["PMT", "EOR"].includes(mine_party_appt_type_code) &&
      related_guid || mine_party_appt_type_code === "MMG";
    if (!hasStartDateValidation || !start_date) {
      return false;
    }
    const toggleEndCurrentAppointment = checkCurrentAppointmentValidation(
      start_date, partyRelationshipDescription, matchingAppointments
    );
    return toggleEndCurrentAppointment;
  };

  // returns validation errors to be displayed to the user.
  const checkDatesForOverlap = (values) => {

    const newAppt = { start_date: null, end_date: null, ...values };

    return validateDateRanges(
      matchingAppointments,
      newAppt,
      partyRelationshipDescription,
      false
    );
  };

  // Validate function that gets called on every touch of the form. This is ignored if the only error is that
  // appointment interferes with the current and the user has decided to end that appointment.
  const validate = (values) => {
    let errors: any = {};

    if (minePartyApptToValidate.includes(mine_party_appt_type_code)) {
      if (values.start_date && values.end_date) {
        if (moment(values.start_date) > moment(values.end_date)) {
          errors.end_date = "Must be after start date.";
        }
      }
      if (isEmpty(errors) && !values.end_current) {
        const { start_date, end_date } = checkDatesForOverlap(values);
        if (
          start_date &&
          !checkCurrentAppointmentValidation(
            values.start_date,
            partyRelationshipDescription,
            matchingAppointments,
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

  let relatedGuidOptions = <div />;
  switch (mine_party_appt_type_code) {
    case "TQP":
    case "EOR":
      relatedGuidOptions = <TSFOptions mine={mine} />;
      break;
    case "URP":
      relatedGuidOptions = <UnionRepOptions />;
      break;
    case "PMT":
    case "THD":
    case "LDO":
    case "MOR":
      relatedGuidOptions = <PermitteeOptions minePermits={minePermits} />;
      break;
    default:
      break;
  }

  const handleSubmit = (values: IMinePartyAppt) => {
    onSubmit({ ...values, ...selectedParty });
  };


  return (
    <FormWrapper
      isModal
      initialValues={{ mine_party_appt_type_code }}
      name={FORM.ADD_PARTY_RELATIONSHIP}
      reduxFormConfig={{
        validate: validate,
        touchOnBlur: false,
        destroyOnUnmount: true,
      }}
      onSubmit={handleSubmit}>
      <Row gutter={16}>
        <Col md={24} xs={24}>
          <PartySelectField
            id="party_guid"
            name="party_guid"
            person={personOnly}
            required
            validate={[required]}
            onSelect={(val) => {
              setSelectedParty(val);
            }}
            allowAddingParties
          />
        </Col>
      </Row>

      {!createPartyOnly && (
        <>
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Field
                id="start_date"
                name="start_date"
                label="Start Date"
                placeholder="yyyy-mm-dd"
                component={renderConfig.DATE}
                required
                validate={[required]}
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
          <Row gutter={16}>
            <Col md={12} xs={24}>
              {showEndCurrent() && (
                <Field
                  id="end_current"
                  name="end_current"
                  label={`Would you like to set the end date of ${currentAppointment?.party?.name
                    } to ${moment(start_date)
                      .subtract(1, "days")
                      .format("MMMM Do YYYY")}`}
                  type="checkbox"
                  component={renderConfig.CHECKBOX}
                />
              )}
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              {relatedGuidOptions}
              {mine_party_appt_type_code === "MMG" && (
                <div>
                  <h4>Mine Manager Appointment Letter</h4>
                  <Field
                    id="PartyRelationshipFileUpload"
                    name="PartyRelationshipFileUpload"
                    onFileLoad={onFileLoad}
                    onRemoveFile={onRemoveFile}
                    mineGuid={mine.mine_guid}
                    component={PartyRelationshipFileUpload}
                  />
                </div>
              )}
            </Col>
          </Row>
        </>
      )}
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText={title} />
      </div>
    </FormWrapper>
  );
};

export default AddPartyRelationshipForm;
