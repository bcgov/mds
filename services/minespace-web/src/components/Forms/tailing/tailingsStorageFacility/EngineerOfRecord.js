import * as PropTypes from "prop-types";

import { Alert, Button, Col, Empty, Popconfirm, Row, Table, Typography } from "antd";
import { Field, change, getFormValues } from "redux-form";
import React, { useEffect, useState } from "react";
import { closeModal, openModal } from "@common/actions/modalActions";

import { MINE_PARTY_APPOINTMENT_DOCUMENTS } from "@common/constants/API";
import { PlusCircleFilled } from "@ant-design/icons";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { getPartyRelationships } from "@common/selectors/partiesSelectors";
import {
  required,
  dateNotInFuture,
  dateInFuture,
  validateDateRanges,
} from "@common/utils/Validate";
import { truncateFilename } from "@common/utils/helpers";
import moment from "moment";
import { isNumber } from "lodash";
import { modalConfig } from "@/components/modalContent/config";
import { renderConfig } from "@/components/common/config";
import { tailingsStorageFacility as TSFType } from "@/customPropTypes/tailings";
import { PDF } from "@/constants/fileTypes";
import LinkButton from "@/components/common/LinkButton";
import FileUpload from "@/components/common/FileUpload";
import ContactDetails from "@/components/common/ContactDetails";
import * as FORM from "@/constants/forms";

const propTypes = {
  change: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(TSFType).isRequired,
  uploadedFiles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  setUploadedFiles: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  partyRelationships: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  loading: PropTypes.bool,
};

const defaultProps = {
  loading: false,
};

const columns = [
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

export const EngineerOfRecord = (props) => {
  const { mineGuid, uploadedFiles, setUploadedFiles, partyRelationships, loading } = props;

  const [, setUploading] = useState(false);
  const [currentEor, setCurrentEor] = useState(null);
  const handleCreateEOR = (value) => {
    props.change(
      FORM.ADD_TAILINGS_STORAGE_FACILITY,
      "engineer_of_record.party_guid",
      value.party_guid
    );
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.party", value);
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.start_date", null);
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.end_date", null);
    props.change(
      FORM.ADD_TAILINGS_STORAGE_FACILITY,
      "engineer_of_record.mine_party_appt_guid",
      null
    );
    setCurrentEor(null);
    props.closeModal();
  };

  useEffect(() => {
    if (partyRelationships.length > 0) {
      const activeEor = partyRelationships.find(
        (eor) =>
          eor.mine_party_appt_guid === props.formValues?.engineer_of_record?.mine_party_appt_guid
      );

      if (activeEor) {
        setCurrentEor(activeEor);
      }
    }
  }, [partyRelationships]);

  const openCreateEORModal = (event) => {
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: handleCreateEOR,
        onCancel: props.closeModal,
        title: "Select Contact",
        mine_party_appt_type_code: "EOR",
      },
      content: modalConfig.ADD_CONTACT,
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
    props.change(
      FORM.ADD_TAILINGS_STORAGE_FACILITY,
      "engineer_of_record.eor_document_guid",
      document_manager_guid
    );
  };

  const onRemoveFile = (_, fileItem) => {
    setUploadedFiles(
      uploadedFiles.filter((file) => file.document_manager_guid !== fileItem.serverId)
    );
    props.change(FORM.ADD_TAILINGS_STORAGE_FACILITY, "engineer_of_record.eor_document_guid", null);
  };

  const validateEorStartDateOverlap = (val) => {
    if (props.formValues?.engineer_of_record?.mine_party_appt_guid || loading) {
      // Skip validation for existing EoRs
      return undefined;
    }

    const existingEors = partyRelationships?.filter(
      (p) =>
        p.mine_party_appt_type_code === "EOR" &&
        p.mine_guid === mineGuid &&
        p.related_guid === props.formValues.mine_tailings_storage_facility_guid
    );

    return (
      validateDateRanges(
        existingEors || [],
        { ...props.formValues?.engineer_of_record, start_date: val },
        "EOR",
        true
      )?.start_date || undefined
    );
  };

  const daysToEORExpiry =
    currentEor?.end_date &&
    moment(currentEor.end_date)
      .startOf("day")
      .diff(moment().startOf("day"), "days");

  return (
    <Row>
      <Col span={24}>
        <Popconfirm
          style={{ maxWidth: "150px" }}
          placement="top"
          title="Once acknowledged by the Ministry, assigning a new Engineer of Record will replace the current one and set the previous status to inactive. Continue?"
          okText="Yes"
          cancelText="No"
          onConfirm={openCreateEORModal}
        >
          <Button style={{ display: "inline", float: "right" }} type="primary">
            <PlusCircleFilled />
            Assign a new Engineer of Record
          </Button>
        </Popconfirm>

        <Typography.Title level={3}>Engineer of Record</Typography.Title>

        {props.formValues?.engineer_of_record?.party_guid ? (
          <Alert
            description="Assigning a new Engineer of Record will replace the current EOR and set the previous EOR’s status to inactive."
            showIcon
            type="info"
          />
        ) : (
          <Alert
            description="There's no Engineer of Record (EOR) on file for this facility. Click above to assign a new EoR. A notification will be sent to the Ministry whereby their acknowledgment is required before the EoR is considered Active."
            showIcon
            type="info"
          />
        )}

        {isNumber(daysToEORExpiry) && daysToEORExpiry >= 0 && daysToEORExpiry <= 30 && (
          <Alert
            message="Engineer of Record will Expire within 30 Days"
            description="To be in compliance, you must have a current, Ministry-approved Engineer of Record on file."
            showIcon
            type="warning"
          />
        )}

        {isNumber(daysToEORExpiry) && daysToEORExpiry < 0 && (
          <Alert
            message="No Engineer of Record"
            description="To be in compliance, you must have a current, Ministry-approved Engineer of Record on file."
            showIcon
            type="error"
          />
        )}

        <Typography.Title level={4} className="margin-large--top">
          Contact Information
        </Typography.Title>

        {props.formValues?.engineer_of_record?.party_guid ? (
          <ContactDetails contact={props.formValues.engineer_of_record.party} />
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
            <Typography.Title level={4} className="margin-large--top">
              Acceptance Letter
            </Typography.Title>
            <Table
              align="left"
              pagination={false}
              columns={columns}
              dataSource={currentEor.documents}
              locale={{ emptyText: "This EoR does not currently have any documents" }}
            />
          </div>
        )}

        {!props.formValues?.engineer_of_record?.mine_party_appt_guid && (
          <>
            <div className="margin-large--top margin-large--bottom">
              <Typography.Title level={4}>Upload Acceptance Letter</Typography.Title>
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
              validate={[required]}
              component={FileUpload}
              disabled={!props.formValues?.engineer_of_record?.party_guid}
              addFileStart={() => setUploading(true)}
              onAbort={() => setUploading(false)}
              uploadUrl={MINE_PARTY_APPOINTMENT_DOCUMENTS(mineGuid)}
              acceptedFileTypesMap={{ ...PDF }}
              labelIdle='<strong class="filepond--label-action">Drag & drop your files or Browse.</strong><div>Accepted format: pdf</div>'
              allowRevert
              onprocessfiles={() => setUploading(false)}
            />
          </>
        )}
        <Typography.Title level={4} className="margin-large--top">
          EOR Term
        </Typography.Title>
        <Row gutter={16}>
          <Col span={12}>
            <Field
              id="engineer_of_record.start_date"
              name="engineer_of_record.start_date"
              label="Start Date"
              disabled={
                !!props.formValues?.engineer_of_record?.mine_party_appt_guid ||
                !props.formValues?.engineer_of_record?.party_guid ||
                loading
              }
              component={renderConfig.DATE}
              validate={[required, dateNotInFuture, validateEorStartDateOverlap]}
            />
          </Col>
          <Col span={12}>
            <Field
              id="engineer_of_record.end_date"
              name="engineer_of_record.end_date"
              label="End Date (Optional)"
              disabled={
                !!props.formValues?.engineer_of_record?.mine_party_appt_guid ||
                !props.formValues?.engineer_of_record?.party_guid ||
                loading
              }
              validate={[dateInFuture]}
              component={renderConfig.DATE}
            />
          </Col>
        </Row>
      </Col>
    </Row>
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
  formValues: getFormValues(FORM.ADD_TAILINGS_STORAGE_FACILITY)(state),
  partyRelationships: getPartyRelationships(state),
});

EngineerOfRecord.propTypes = propTypes;
EngineerOfRecord.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(EngineerOfRecord);
