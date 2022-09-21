import * as FORM from "@/constants/forms";
import * as PropTypes from "prop-types";

import { Alert, Button, Col, Empty, Popconfirm, Row, Typography } from "antd";
import { Field, change, getFormValues } from "redux-form";
import { closeModal, openModal } from "@common/actions/modalActions";

import ContactDetails from "@/components/common/ContactDetails";
import { PlusCircleFilled } from "@ant-design/icons";
import React, { useState } from "react";
import { tailingsStorageFacility as TSFType } from "@/customPropTypes/tailings";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { modalConfig } from "@/components/modalContent/config";
import { renderConfig } from "@/components/common/config";
import { required } from "@common/utils/Validate";
import FileUpload from "@/components/common/FileUpload";
import { MINE_PARTY_APPOINTMENT_DOCUMENTS } from "@common/constants/API";
import { PDF } from "@/constants/fileTypes";

const propTypes = {
  change: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  formValues: PropTypes.objectOf(TSFType).isRequired,
  uploadedFiles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  setUploadedFiles: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export const EngineerOfRecord = (props) => {
  const { mineGuid, uploadedFiles, setUploadedFiles } = props;
  const [, setUploading] = useState(false);
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
    props.closeModal();
  };

  const openCreateEORModal = (event) => {
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: handleCreateEOR,
        onCancel: props.closeModal,
        title: "Select Contact",
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
        <div className="margin-large--top margin-large--bottom">
          <Typography.Title level={4}>Upload Acceptance Letter</Typography.Title>
          <Typography.Text>
            Letter must be officially signed. A notification will be sent to the Mine Manager upon
            upload.
          </Typography.Text>
        </div>
        <Field
          name="engineer_of_record.acceptance_letter"
          id="engineer_of_record.acceptance_letter"
          onFileLoad={onFileLoad}
          onRemoveFile={onRemoveFile}
          component={FileUpload}
          addFileStart={() => setUploading(true)}
          onAbort={() => setUploading(false)}
          uploadUrl={MINE_PARTY_APPOINTMENT_DOCUMENTS(mineGuid)}
          acceptedFileTypesMap={{ ...PDF }}
          labelIdle='<strong class="filepond--label-action">Drag & drop your files or Browse.</strong><div>Accepted format: pdf</div>'
          allowRevert
          onprocessfiles={() => setUploading(false)}
        />
        <Typography.Title level={4} className="margin-large--top">
          EOR Term
        </Typography.Title>
        <Row gutter={16}>
          <Col span={12}>
            <Field
              id="engineer_of_record.start_date"
              name="engineer_of_record.start_date"
              label="Start Date"
              disabled={!!props.formValues?.engineer_of_record?.mine_party_appt_guid}
              component={renderConfig.DATE}
              validate={[required]}
            />
          </Col>
          <Col span={12}>
            <Field
              id="engineer_of_record.end_date"
              name="engineer_of_record.end_date"
              label="End Date"
              disabled={!!props.formValues?.engineer_of_record?.mine_party_appt_guid}
              validate={[required]}
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
});

EngineerOfRecord.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(EngineerOfRecord);
