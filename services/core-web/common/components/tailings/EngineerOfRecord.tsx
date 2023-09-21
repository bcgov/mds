import { Alert, Button, Col, Empty, Popconfirm, Row, Typography } from "antd";
import { change, ChangeAction, Field, getFormValues } from "redux-form";
import React, { FC, useContext, useEffect, useState } from "react";
import { closeModal, openModal } from "@common/actions/modalActions";
import { IDocument, IMine, IMinePartyAppt, IParty, PARTY_APPOINTMENT_STATUS } from "@mds/common";

import { MINE_PARTY_APPOINTMENT_DOCUMENTS } from "@common/constants/API";
import { PlusCircleFilled } from "@ant-design/icons";
import { bindActionCreators } from "redux";
import { connect, useSelector } from "react-redux";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import {
  dateInFuture,
  dateNotInFuture,
  required,
  validateDateRanges,
} from "@common/utils/Validate";
import { formatDateTime, truncateFilename } from "@common/utils/helpers";
import { PDF } from "@common/constants/fileTypes";

import moment from "moment";
import { isNumber } from "lodash";
import TailingsContext from "@common/components/tailings/TailingsContext";
import { getMines } from "@common/selectors/mineSelectors";
import PartyAppointmentTable from "../PartyAppointmentTable";
import { ColumnsType } from "antd/lib/table";
import CoreTable from "@/components/common/CoreTable";

interface EngineerOfRecordProps {
  change: (
    field: string,
    value: any,
    touch?: boolean,
    persistentSubmitErrors?: boolean
  ) => ChangeAction;
  openModal: (value: any) => void;
  closeModal: () => void;
  uploadedFiles: IDocument[];
  setUploadedFiles: (value: Partial<IDocument>) => void;
  mineGuid: string;
  partyRelationships: IMinePartyAppt[];
  loading?: boolean;
  mines: IMine[];
}

const columns = (LinkButton): ColumnsType<IParty> => [
  {
    title: "File Name",
    dataIndex: "document_name",
    render: (text, record) => {
      return (
        <div title="File Name" key={record.mine_document_guid}>
          <LinkButton title={text} onClick={() => downloadFileFromDocumentManager(record)}>
            {truncateFilename(text)}
          </LinkButton>
        </div>
      );
    },
  },
];

export const EngineerOfRecord: FC<EngineerOfRecordProps> = (props) => {
  const { mineGuid, uploadedFiles, setUploadedFiles, partyRelationships, loading, mines } = props;

  const [openPopConfirm, setOpenPopConfirm] = useState(false);

  const {
    renderConfig,
    components,
    addContactModalConfig,
    tsfFormName,
    showUpdateTimestamp,
    canAssignEor,
    eorHistoryColumns,
    isCore,
  } = useContext(TailingsContext);

  const formValues = useSelector((state) => getFormValues(tsfFormName)(state));

  const { LinkButton, ContactDetails } = components;

  const [, setUploading] = useState(false);
  const [currentEor, setCurrentEor] = useState(null);
  const handleCreateEOR = (value) => {
    props.change(tsfFormName, "engineer_of_record.party_guid", value.party_guid);
    props.change(tsfFormName, "engineer_of_record.party", value);
    props.change(tsfFormName, "engineer_of_record.start_date", null);
    props.change(tsfFormName, "engineer_of_record.end_date", null);
    props.change(tsfFormName, "engineer_of_record.mine_party_appt_guid", null);
    setCurrentEor(null);
    props.closeModal();
  };

  useEffect(() => {
    if (partyRelationships.length > 0) {
      const activeEor = partyRelationships.find(
        (eor) => eor.mine_party_appt_guid === formValues?.engineer_of_record?.mine_party_appt_guid
      );

      if (activeEor) {
        setCurrentEor(activeEor);
      }
    }
  }, [partyRelationships]);

  const openCreateEORModal = (event) => {
    event?.preventDefault();
    setOpenPopConfirm(false);

    props.openModal({
      props: {
        onSubmit: handleCreateEOR,
        onCancel: props.closeModal,
        title: "Select Contact",
        partyRelationships,
        mine_party_appt_type_code: "EOR",
        partyRelationshipType: "EOR",
        mine: mines[mineGuid],
        createPartyOnly: true,
      },
      content: addContactModalConfig,
    });
  };

  const onFileLoad = (documentName, document_manager_guid) => {
    setUploadedFiles([
      ...uploadedFiles,
      {
        document_name: documentName,
        document_manager_guid,
      },
    ]);
    props.change(tsfFormName, "engineer_of_record.eor_document_guid", document_manager_guid);
  };

  const onRemoveFile = (_, fileItem) => {
    setUploadedFiles(
      uploadedFiles.filter((file) => file.document_manager_guid !== fileItem.serverId)
    );
    props.change(tsfFormName, "engineer_of_record.eor_document_guid", null);
  };

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

  const daysToEORExpiry =
    currentEor?.end_date &&
    moment(currentEor.end_date)
      .startOf("day")
      .diff(moment().startOf("day"), "days");

  // Enable editing of the EoR when a new EoR party has been selected (party_guid is set),
  // but it has yet to be assigned to the TSF (mine_party_appt_guid is not set).
  const canEditEOR =
    formValues?.engineer_of_record?.party_guid &&
    !formValues?.engineer_of_record?.mine_party_appt_guid;

  const fieldsDisabled = !canEditEOR || loading;

  const hasPendingEOR = formValues?.engineers_of_record?.some(
    (eor) => PARTY_APPOINTMENT_STATUS[eor.status] === PARTY_APPOINTMENT_STATUS.pending
  );

  const hasCurrentEOR = formValues?.engineers_of_record?.some(
    (eor) => PARTY_APPOINTMENT_STATUS[eor.status] === PARTY_APPOINTMENT_STATUS
  );

  const handleCreateEORModal = (newOpen: boolean) => {
    if (!newOpen) {
      setOpenPopConfirm(newOpen);
      return;
    }
    if (hasCurrentEOR || hasPendingEOR) {
      setOpenPopConfirm(true);
    } else {
      openCreateEORModal(undefined);
    }
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <Row justify="space-between">
            <Typography.Title level={4}>Engineer of Record</Typography.Title>

            <Col span={12}>
              <Row justify="end">
                {canAssignEor && (
                  <Popconfirm
                    style={{ maxWidth: "150px" }}
                    open={openPopConfirm}
                    placement="top"
                    title="Once acknowledged by the Ministry, assigning a new Engineer of Record will replace the current one and set the previous status to inactive. Continue?"
                    okText="Yes"
                    cancelText="No"
                    onOpenChange={handleCreateEORModal}
                    onConfirm={openCreateEORModal}
                    onCancel={() => setOpenPopConfirm(false)}
                  >
                    <Button style={{ display: "inline", float: "right" }} type="primary">
                      <PlusCircleFilled />
                      Assign a new Engineer of Record
                    </Button>
                  </Popconfirm>
                )}
                {showUpdateTimestamp && formValues?.engineer_of_record?.update_timestamp && (
                  <Typography.Paragraph style={{ textAlign: "right" }}>
                    <b>Last Updated</b>
                    <br />
                    {formatDateTime(formValues.engineer_of_record.update_timestamp)}
                  </Typography.Paragraph>
                )}
              </Row>
            </Col>
          </Row>

          {canAssignEor &&
            (formValues?.engineer_of_record?.party_guid ? (
              <Alert
                description="Assigning a new Engineer of Record will replace the current Engineer of Record and set the previous Engineer of Record’s status to inactive."
                showIcon
                type="info"
                message={""}
              />
            ) : (
              <Alert
                description="Assigning a new Engineer of Record (EoR) will replace the current listed contact and set their status to Inactive. When a new EoR is assigned, a notification will be sent to the Ministry of changes in the record, and must include an acknowledgement by the EoR to be active."
                showIcon
                type="info"
                message={""}
              />
            ))}

          {hasPendingEOR && isCore && (
            <Alert
              description="An Engineer of Record for this facility is awaiting Ministry acknowledgment below. Please contact the mine directly for any issues."
              showIcon
              type="warning"
              message={""}
            />
          )}

          {isNumber(daysToEORExpiry) && daysToEORExpiry >= 0 && daysToEORExpiry <= 60 && (
            <Alert
              message="Engineer of Record will Expire within 60 Days"
              description="To be in compliance, you must have a current, Ministry-acknowledged Engineer of Record on file."
              showIcon
              type="warning"
            />
          )}

          {isNumber(daysToEORExpiry) && daysToEORExpiry < 0 && (
            <Alert
              message="No Engineer of Record"
              description="To be in compliance, you must have a current, Ministry-acknowledged Engineer of Record on file."
              showIcon
              type="error"
            />
          )}

          <h3>Contact Information (Optional)</h3>

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
          {currentEor && currentEor.documents.length > 0 && (
            <div>
              <h3>Acceptance Letter</h3>
              <CoreTable
                columns={columns(LinkButton)}
                dataSource={currentEor.documents}
                emptyText="This Engineer of Record does not currently have any documents"
              />
            </div>
          )}

          {!formValues?.engineer_of_record?.mine_party_appt_guid && (
            <>
              <div className="margin-large--top margin-large--bottom">
                <h3>Upload Acceptance Letter *</h3>
                <Typography.Text>
                  Letter must be officially signed. A notification will be sent to the Mine Manager
                  upon upload.
                </Typography.Text>
              </div>
              <Field
                name="engineer_of_record.eor_document_guid"
                id="engineer_of_record.eor_document_guid"
                onFileLoad={onFileLoad}
                onRemoveFile={onRemoveFile}
                validate={!fieldsDisabled && [required]}
                component={renderConfig.FILE_UPLOAD}
                disabled={fieldsDisabled}
                addFileStart={() => setUploading(true)}
                onAbort={() => setUploading(false)}
                uploadUrl={MINE_PARTY_APPOINTMENT_DOCUMENTS(mineGuid)}
                acceptedFileTypesMap={{ ...PDF }}
                labelIdle='<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><br>
                <div>Accepted formats: pdf</div>'
                allowRevert
                onprocessfiles={() => setUploading(false)}
              />
            </>
          )}
          <h3>Engineer of Record Term</h3>
          <Typography.Paragraph>
            Enter the start, and if known, the end date of the Engineer of Record including a
            termination date if applicable.
          </Typography.Paragraph>
          <Row gutter={16}>
            <Col span={12}>
              <Field
                id="engineer_of_record.start_date"
                name="engineer_of_record.start_date"
                label="Start Date *"
                disabled={fieldsDisabled}
                component={renderConfig.DATE}
                validate={
                  !fieldsDisabled && [required, dateNotInFuture, validateEorStartDateOverlap]
                }
              />
            </Col>
            <Col span={12}>
              <Field
                id="engineer_of_record.end_date"
                name="engineer_of_record.end_date"
                label="End Date (Optional)"
                disabled={fieldsDisabled}
                validate={!fieldsDisabled && [dateInFuture]}
                component={renderConfig.DATE}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <PartyAppointmentTable
            columns={eorHistoryColumns}
            partyRelationships={formValues?.engineers_of_record}
          />
        </Col>
      </Row>
    </>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      change,
    },
    dispatch
  );

const mapStateToProps = (state) => ({
  partyRelationships: getPartyRelationships(state),
  mines: getMines(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(EngineerOfRecord);
