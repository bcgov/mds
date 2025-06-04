import { Alert, Col, Empty, Row, Typography } from "antd";
import { change, Field, getFormValues } from "@mds/common/components/forms/form";
import React, { FC, useContext } from "react";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { IMine, IMinePartyAppt, ITailingsStorageFacilityForm } from "@mds/common/interfaces";
import { TailingsContext } from "./TailingsContext";
import { getPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";
import {
  dateInFuture,
  dateNotInFuture,
  required,
  validateDateRanges,
} from "@mds/common/redux/utils/Validate";
import { formatDateTime } from "@mds/common/redux/utils/helpers";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import PartyAppointmentTable from "./PartyAppointmentTable";
import { PARTY_APPOINTMENT_STATUS } from "@mds/common/constants/strings";
import RenderDate from "../forms/RenderDate";
import { FORM } from "@mds/common/constants/forms";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import ContactDetails from "./ContactDetails";
import { MinePartyAppointmentTypeCodeEnum } from "@mds/common/constants/enums";
import { ActionMenuButton } from "../common/ActionMenu";
import EditTsfAppointmentForm, { AppointmentEditAction } from "./EditTsfAppointmentForm";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";

const { Paragraph } = Typography;

interface EngineerOfRecordProps {
  mineGuid: string;
  loading?: boolean;
  canEditTSF: boolean;
  isEditMode: boolean;
}

export const EngineerOfRecord: FC<EngineerOfRecordProps> = (props) => {
  const { mineGuid, loading, canEditTSF, isEditMode } = props;

  const isCore = useAppSelector(getIsCore);
  const dispatch = useAppDispatch();
  const { isFeatureEnabled } = useFeatureFlag();
  const canTerminateAppts = isFeatureEnabled(Feature.TSF_TERMINATE_APPTS);

  const { addContactModalConfig } = useContext(TailingsContext);
  const tsfFormName = FORM.ADD_TAILINGS_STORAGE_FACILITY;
  const partyRelationships: IMinePartyAppt[] = useAppSelector(getPartyRelationships);
  const mine: IMine = useAppSelector(getMineById(mineGuid));

  const formValues = useAppSelector(getFormValues(tsfFormName)) as ITailingsStorageFacilityForm;

  const handleCreateEOR = (value) => {
    dispatch(change(tsfFormName, "engineer_of_record.party_guid", value.party_guid));
    dispatch(change(tsfFormName, "engineer_of_record.party", value));
    dispatch(change(tsfFormName, "engineer_of_record.start_date", null));
    dispatch(change(tsfFormName, "engineer_of_record.end_date", null));
    dispatch(change(tsfFormName, "engineer_of_record.mine_party_appt_guid", null));
    dispatch(closeModal());
  };

  const canEditTSFAndEditMode = canEditTSF && isEditMode;

  const openCreateEORModal = () => {
    dispatch(
      openModal({
        props: {
          onSubmit: handleCreateEOR,
          title: "Select Contact",
          partyRelationships,
          mine_party_appt_type_code: MinePartyAppointmentTypeCodeEnum.EOR,
          mine: mine,
          createPartyOnly: true,
        },
        content: addContactModalConfig,
      })
    );
  };

  const openEditEORModal = () => {
    dispatch(
      openModal({
        props: {
          title: "Terminate Engineer of Record",
          partyAppointment: formValues?.engineer_of_record,
          tsfGuid: formValues?.mine_tailings_storage_facility_guid,
          action: AppointmentEditAction.END
        },
        content: EditTsfAppointmentForm
      })
    )
  }

  const existingEors = partyRelationships?.filter(
    (p) =>
      p.mine_party_appt_type_code === "EOR" &&
      p.mine_guid === mineGuid &&
      p.related_guid === formValues.mine_tailings_storage_facility_guid
  );

  const validateEorStartDateOverlap = (val) => {
    if (formValues?.engineer_of_record?.mine_party_appt_guid || loading) {
      // Skip validation for existing EoRs
      return undefined;
    }

    return (
      validateDateRanges(
        existingEors || [],
        { ...formValues?.engineer_of_record, start_date: val },
        "Engineer of Record",
        true
      )?.start_date || undefined
    );
  };

  // Enable editing of the EoR when a new EoR party has been selected (party_guid is set),
  // but it has yet to be assigned to the TSF (mine_party_appt_guid is not set).
  const canEditEOR =
    formValues?.engineer_of_record?.party_guid &&
    !formValues?.engineer_of_record?.mine_party_appt_guid;

  const showEditFields = canEditEOR && !loading && canEditTSFAndEditMode;

  const eorActions = [
    {
      key: "assign",
      label: "Assign New Engineer of Record",
      clickFunction: openCreateEORModal
    },
    (formValues?.engineer_of_record && canTerminateAppts) && {
      key: "terminate",
      label: "Terminate Current Engineer of Record",
      clickFunction: openEditEORModal
    }
  ].filter(Boolean);

  return (
    <>
      <Row>
        <Col span={24}>
          <Row justify="space-between">
            <Typography.Title level={3}>Engineer of Record</Typography.Title>
            <Col span={12}>
              <Row justify="end">
                {canEditTSFAndEditMode && (
                  <ActionMenuButton
                    buttonText="Manage Engineer of Record"
                    buttonProps={{ type: "primary" }}
                    actions={eorActions}
                  />
                )}
              </Row>
              {formValues?.engineer_of_record?.update_timestamp && (
                <div>
                  <Typography.Paragraph
                    className="margin-none--bottom margin-large--top"
                    style={{ textAlign: "right" }}
                  >
                    Updated By: {formValues.engineer_of_record.update_user}
                  </Typography.Paragraph>
                  <Typography.Paragraph style={{ textAlign: "right" }}>
                    Updated Date: {formatDateTime(formValues.engineer_of_record.update_timestamp)}
                  </Typography.Paragraph>
                </div>
              )}
            </Col>
          </Row>
          <Alert
            message={<Paragraph strong>Engineer of Record Assignment</Paragraph>}
            description={
              <Paragraph>
                As{" "}
                <a
                  href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/health-safety/health-safety-and-reclamation-code-for-mines-in-british-columbia"
                  target="_blank"
                >
                  Per Health, Safety and Reclamation Code
                </a>
                {" "}10.4.1, written acknowledgement to the Chief Inspector is required within 72 hours when an
                Engineer of Record (EoR) is retained, accepts or departs the role. A report request will be
                generated upon changes to the EoR.
              </Paragraph>
            }
            showIcon
            type="info"
          />

          <Typography.Title level={4} className="margin-large--top">
            Contact Information
          </Typography.Title>

          {formValues?.engineer_of_record?.party_guid ? (
            <ContactDetails contact={formValues.engineer_of_record.party} />
          ) : (
            <Row justify="center">
              <Col span={24}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  imageStyle={{ transform: "scale(1.5)" }}
                  description={false}
                />
              </Col>

              <Typography.Paragraph>No Data</Typography.Paragraph>
            </Row>
          )}
          <Typography.Title level={4} className="margin-large--top">
            Engineer of Record Term
          </Typography.Title>
          <Typography.Paragraph>
            Enter the start, and if known, the end date of the Engineer of Record including a
            termination date if applicable.
          </Typography.Paragraph>
          <Row gutter={16}>
            <Col span={12}>
              <Field
                id="engineer_of_record.start_date"
                name="engineer_of_record.start_date"
                label="Start Date"
                disabled={!showEditFields}
                fieldEditMode={showEditFields}
                component={RenderDate}
                required={!!showEditFields}
                validate={
                  showEditFields ? [required, dateNotInFuture, validateEorStartDateOverlap] : []
                }
              />
            </Col>
            <Col span={12}>
              <Field
                id="engineer_of_record.end_date"
                name="engineer_of_record.end_date"
                label="End Date"
                fieldEditMode={showEditFields}
                validate={showEditFields ? [dateInFuture] : []}
                component={RenderDate}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <PartyAppointmentTable canEditTSF={canEditTSFAndEditMode} />
        </Col>
      </Row>
    </>
  );
};

export default EngineerOfRecord;
