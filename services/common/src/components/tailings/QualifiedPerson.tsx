import { Alert, Col, Empty, Row, Typography } from "antd";
import { change, Field, getFormValues } from "@mds/common/components/forms/form";
import React, { FC, useContext } from "react";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { getPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";
import {
  dateInFuture,
  dateNotInFuture,
  required,
  validateDateRanges,
} from "@mds/common/redux/utils/Validate";
import ContactDetails from "./ContactDetails";
import { TailingsContext } from "@mds/common/components/tailings/TailingsContext";
import { ICreateTailingsStorageFacility } from "@mds/common/interfaces";
import RenderDate from "../forms/RenderDate";
import { FORM } from "@mds/common/constants/forms";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { MinePartyAppointmentTypeCodeEnum } from "@mds/common/constants/enums";
import PartyAppointmentTable from "@mds/common/components/tailings/PartyAppointmentTable";
import { formatDateTime } from "@mds/common/redux/utils/helpers";
import { ActionMenuButton } from "../common/ActionMenu";
import EditTsfAppointmentForm, { AppointmentEditAction } from "./EditTsfAppointmentForm";

const { Paragraph } = Typography;

interface QualifiedPersonProps {
  mineGuid: string;
  loading?: boolean;
  canEditTSF: boolean;
  isEditMode: boolean;
}

export const QualifiedPerson: FC<QualifiedPersonProps> = (props) => {
  const dispatch = useAppDispatch();
  const { mineGuid, canEditTSF, isEditMode } = props;
  const { addContactModalConfig } = useContext(TailingsContext);
  const tsfFormName = FORM.ADD_TAILINGS_STORAGE_FACILITY;
  const formValues = useAppSelector(getFormValues(tsfFormName)) as ICreateTailingsStorageFacility;
  const partyRelationships = useAppSelector(getPartyRelationships);

  const canEditTSFAndEditMode = canEditTSF && isEditMode;

  const handleCreateQP = (value) => {
    dispatch(change(tsfFormName, "qualified_person.party_guid", value.party_guid));
    dispatch(change(tsfFormName, "qualified_person.party", value));
    dispatch(change(tsfFormName, "qualified_person.start_date", null));
    dispatch(change(tsfFormName, "qualified_person.end_date", null));
    dispatch(change(tsfFormName, "qualified_person.mine_party_appt_guid", null));
    dispatch(closeModal());
  };

  const openCreateQPModal = () => {
    dispatch(
      openModal({
        props: {
          onSubmit: handleCreateQP,
          title: "Select Contact",
          mine_party_appt_type_code: MinePartyAppointmentTypeCodeEnum.TQP,
          mine: { mine_guid: mineGuid, mine_tailings_storage_facilities: [] },
          createPartyOnly: true,
        },
        content: addContactModalConfig,
      })
    );
  };

  const validateQPStartDateOverlap = (val) => {
    if (formValues?.qualified_person?.mine_party_appt_guid || props.loading) {
      // Skip validation for existing TQPs
      return undefined;
    }

    const existingEors = partyRelationships?.filter(
      (p) =>
        p.mine_party_appt_type_code === "TQP" &&
        p.mine_guid === props.mineGuid &&
        p.related_guid === formValues?.mine_tailings_storage_facility_guid
    );

    return (
      validateDateRanges(
        existingEors || [],
        { ...formValues?.qualified_person, start_date: val },
        "Qualified Person",
        true
      )?.start_date || undefined
    );
  };

  // Enable editing of the QFP when a new EoR party has been selected (party_guid is set),
  // but it has yet to be assigned to the TSF (mine_party_appt_guid is not set).
  const canEditQFP =
    formValues?.qualified_person?.party_guid && !formValues?.qualified_person?.mine_party_appt_guid;

  const fieldsDisabled = !canEditQFP || props.loading || !canEditTSFAndEditMode;

  const openEditQPModal = () => {
    dispatch(
      openModal({
        props: {
          title: "Terminate Qualified Person",
          partyAppointment: formValues?.qualified_person,
          tsfGuid: formValues?.mine_tailings_storage_facility_guid,
          action: AppointmentEditAction.END,
        },
        content: EditTsfAppointmentForm,
      })
    );
  };

  const qpActions = [
    {
      key: "assign",
      label: "Assign New Qualified Person",
      clickFunction: openCreateQPModal,
    },
    (formValues?.qualified_person && formValues?.qualified_person?.party_guid) && {
      key: "terminate",
      label: "Terminate Qualified Person",
      clickFunction: openEditQPModal,
    },
  ].filter(Boolean);

  return (
    <Row>
      <Col span={24}>
        <Row justify="space-between" gutter={[16, 16]}>
          <Typography.Title level={3}>TSF Qualified Person</Typography.Title>
          <Col span={12}>
            <Row justify="end">
              {canEditTSFAndEditMode && (
                <ActionMenuButton
                  buttonText="Manage Qualified Person"
                  buttonProps={{ type: "primary" }}
                  actions={qpActions}
                />
              )}
              {formValues?.qualified_person?.update_timestamp && (
                <div>
                  <Typography.Paragraph
                    className="margin-none--bottom margin-large--top"
                    style={{ textAlign: "right" }}
                  >
                    Updated By: {formValues.qualified_person.update_user}
                  </Typography.Paragraph>
                  <Typography.Paragraph style={{ textAlign: "right" }}>
                    Updated Date: {formatDateTime(formValues.qualified_person.update_timestamp)}
                  </Typography.Paragraph>
                </div>
              )}
            </Row>
          </Col>
        </Row>
        <Alert
          message={<Paragraph strong>Qualified Person Assignment</Paragraph>}
          description={
            <Paragraph>
              As{" "}
              <a
                href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/health-safety/health-safety-and-reclamation-code-for-mines-in-british-columbia"
                target="_blank"
              >
                Per Health, Safety and Reclamation Code
              </a>
              {" "}10.4.2, written acknowledgement to the Chief Inspector is required within 72 hours when a
              Qualified Person (QP) is retained, accepts or departs the role. A report request will be
              generated upon changes to the Qualified Person.
            </Paragraph>
          }
          showIcon
          type="info"
        />
        <Typography.Title level={4} className="margin-large--top">
          Contact Information
        </Typography.Title>

        {formValues?.qualified_person?.party_guid ? (
          <ContactDetails contact={formValues.qualified_person.party} />
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
          TSF Qualified Person Term
        </Typography.Title>
        <Row gutter={16}>
          <Col span={12}>
            <Field
              id="qualified_person.start_date"
              name="qualified_person.start_date"
              label="Start Date"
              disabled={fieldsDisabled}
              component={RenderDate}
              required={!fieldsDisabled}
              validate={!fieldsDisabled ? [required, dateNotInFuture, validateQPStartDateOverlap] : []}
            />
          </Col>
          <Col span={12}>
            <Field
              id="qualified_person.end_date"
              name="qualified_person.end_date"
              label="End Date"
              disabled={fieldsDisabled}
              validate={!fieldsDisabled ? [dateInFuture] : []}
              component={RenderDate}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <PartyAppointmentTable
              canEditTSF={canEditTSFAndEditMode}
              eor_or_qp="qualified_persons"
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default QualifiedPerson;
