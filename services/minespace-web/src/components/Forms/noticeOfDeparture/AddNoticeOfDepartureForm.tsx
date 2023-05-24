import React, { useEffect, useState } from "react";
import {
  change,
  Field,
  FieldArray,
  FieldArrayFieldsProps,
  InjectedFormProps,
  reduxForm,
} from "redux-form";
import { Alert, Button, Col, Popconfirm, Row, Typography } from "antd";
import { Form } from "@ant-design/compatible";
import {
  email,
  maxLength,
  phoneNumber,
  required,
  requiredList,
  requiredRadioButton,
  validateSelectOptions,
} from "@common/utils/Validate";
import { normalizePhone, resetForm } from "@common/utils/helpers";
import { NOD_TYPE_FIELD_VALUE, NOTICE_OF_DEPARTURE_DOCUMENT_TYPE } from "@common/constants/strings";
import { bindActionCreators, compose } from "redux";
import { DOCUMENT, EXCEL, SPATIAL } from "@common/constants/fileTypes";
import { NOTICE_OF_DEPARTURE_DOWNLOAD_LINK } from "@/constants/strings";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import NoticeOfDepartureFileUpload from "@/components/Forms/noticeOfDeparture/NoticeOfDepartureFileUpload";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import {
  ICreateNoD,
  INoDContactInterface,
  INodDocumentPayload,
  INoticeOfDeparture,
  INoDPermit,
} from "@mds/common";
import { AxiosResponse } from "axios";
import { connect } from "react-redux";

interface RenderContactsProps {
  fields: FieldArrayFieldsProps<INoDContactInterface>;
}

interface AddNoticeOfDepartureProps {
  permits: INoDPermit[];
  onSubmit: (
    permitNumber: string,
    values: ICreateNoD,
    documentArray: INodDocumentPayload
  ) => Promise<AxiosResponse<INoticeOfDeparture>>;
  closeModal: () => void;
  mineGuid: string;
  handleSubmit?: any;
  change?: (fieldName: string, value: any) => void;
  initialValues: { nod_contacts: [{ is_primary: boolean }] };
}

export const renderContacts: React.FC<RenderContactsProps> = (props) => {
  const { fields } = props;
  return (
    <div className="margin-large--bottom">
      {fields.length > 0 && (
        <Typography.Title level={5} className="nod-modal-section-header">
          Primary Contact
        </Typography.Title>
      )}
      {fields.map((contact, index) => (
        <Row gutter={16} key={index}>
          <Col span={12}>
            <Field
              label="First Name"
              id={`${contact}.first_name`}
              name={`${contact}.first_name`}
              placeholder="First Name"
              component={renderConfig.FIELD}
              validate={[required, maxLength(200)]}
            />
          </Col>
          <Col span={12}>
            <Field
              label="Last Name"
              id={`${contact}.last_name`}
              name={`${contact}.last_name`}
              placeholder="Last Name"
              component={renderConfig.FIELD}
              validate={[required, maxLength(200)]}
            />
          </Col>
          <Col span={12}>
            <Field
              name={`${contact}.phone_number`}
              id={`${contact}.phone_number`}
              label="Phone Number"
              placeholder="XXX-XXX-XXXX"
              component={renderConfig.FIELD}
              validate={[phoneNumber, maxLength(12), required]}
              normalize={normalizePhone}
            />
          </Col>
          <Col span={12}>
            <Field
              label="Email"
              id={`${contact}.email`}
              name={`${contact}.email`}
              component={renderConfig.FIELD}
              placeholder="example@example.com"
              validate={[email, required]}
            />
          </Col>
        </Row>
      ))}
    </div>
  );
};

const AddNoticeOfDepartureForm: React.FC<
  InjectedFormProps<ICreateNoD> & AddNoticeOfDepartureProps
> = (props) => {
  const { permits, onSubmit, closeModal, handleSubmit, mineGuid, change } = props;
  const [submitting, setSubmitting] = useState(false);
  const [hasChecklist, setHasChecklist] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [permitOptions, setPermitOptions] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [documentArray, setDocumentArray] = useState([]);

  useEffect(() => {
    if (permits.length > 0) {
      setPermitOptions(
        permits.map((permit) => ({
          label: permit.permit_no,
          value: permit.permit_guid,
        }))
      );
    }
    change("uploadedFiles", []);
  }, []);

  const handleNoticeOfDepartureSubmit = (values) => {
    setSubmitting(true);
    const { permitNumber } = values;
    onSubmit(permitNumber, values, documentArray).finally(() => setSubmitting(false));
  };

  const onFileLoad = (
    documentName: string,
    document_manager_guid: string,
    documentType: string
  ) => {
    setUploadedFiles([
      ...uploadedFiles,
      {
        documentType,
        documentName,
        document_manager_guid,
      },
    ]);
    setDocumentArray([
      ...documentArray,
      {
        document_type: documentType,
        document_name: documentName,
        document_manager_guid,
      },
    ]);
    if (documentType === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST) {
      change("self-assessment", documentName);
      setHasChecklist(true);
    }
  };

  useEffect(() => {
    change("uploadedFiles", documentArray);
  }, [documentArray]);

  const onRemoveFile = (_, fileItem) => {
    const removedDoc = documentArray.find((doc) => doc.document_manager_guid === fileItem.serverId);
    if (removedDoc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST) {
      setHasChecklist(false);
      change("self-assessment", null);
    }
    setDocumentArray(
      documentArray.filter((document) => document.document_manager_guid !== fileItem.serverId)
    );
    setUploadedFiles(
      uploadedFiles.filter((file) => file.document_manager_guid !== fileItem.serverId)
    );
  };

  return (
    <div>
      <Form layout="vertical" onSubmit={handleSubmit(handleNoticeOfDepartureSubmit)}>
        <Typography.Text>
          Please complete the following form to submit your Notice of Departure and any relevant
          supporting documents. For more information on the purpose and intent of a Notice of
          Departure{" "}
          <a
            href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/mines-act-permits/mines-act-departures-from-approval"
            target="_blank"
            rel="noopener noreferrer"
          >
            Click Here
          </a>
          .
        </Typography.Text>
        <h4 className="nod-modal-section-header">Basic Information</h4>
        <div className="margin-large--bottom">
          <Typography.Text>
            Enter the following information about your Notice of Departure.
          </Typography.Text>
        </div>
        <Field
          label="Departure Project Title"
          id="nodTitle"
          name="nod_title"
          placeholder="Departure Project Title"
          component={renderConfig.FIELD}
          validate={[required, maxLength(50)]}
        />
        <Row gutter={16}>
          <Col span={12}>
            <Field
              label="Permit #"
              id="permitGuid"
              name="permit_guid"
              placeholder="Select Permit #"
              component={renderConfig.SELECT}
              validate={[requiredList, validateSelectOptions(permitOptions)]}
              data={permitOptions}
            />
          </Col>
        </Row>
        <Field
          id="nod_description"
          name="nod_description"
          label="Departure Summary"
          component={renderConfig.AUTO_SIZE_FIELD}
          validate={[maxLength(3000), required]}
        />
        <FieldArray props={{}} name="nod_contacts" component={renderContacts} />
        <h4 className="nod-modal-section-header">
          Notice of Departure Self-Assessment Determination
        </h4>
        <Form.Item>
          <Field
            id="nod_type"
            name="nod_type"
            label="Based on the information established in your self-assessment form please determine your
          submissions Notice of Departure type. If you are unsure what category you fall under,
          please contact us."
            component={RenderRadioButtons}
            validate={[requiredRadioButton]}
            customOptions={[
              {
                value: NOD_TYPE_FIELD_VALUE.NON_SUBSTANTIAL,
                label:
                  "This Notice of Departure is non-substantial and does not require ministry review.  (Proponent is responsible for ensuring all details have been completed correctly for submission and can begin work immediately)",
              },
              {
                value: NOD_TYPE_FIELD_VALUE.POTENTIALLY_SUBSTANTIAL,
                label:
                  "This Notice of Departure is potentially substantial and requires ministry review.  (Ministry staff will review submission and determine if work can move forward as Notice of Departure)",
              },
            ]}
          />
        </Form.Item>
        <h4 className="nod-modal-section-header">
          Upload Notice of Departure Self-Assessment Form
        </h4>
        <Typography.Text>
          Please upload your completed Self-assessment form (
          <a href={NOTICE_OF_DEPARTURE_DOWNLOAD_LINK} target="_blank" rel="noopener noreferrer">
            click here to download
          </a>
          ) below. Remember your completed form must be signed by the Mine Manager and any
          supporting information included or uploaded.
        </Typography.Text>
        {hasChecklist && (
          <Alert
            className="margin-y-large"
            message="Note: Uploading a new self-assessment form will replace the existing version.  Additional files can be uploaded in the 'Upload Application Documents' section at the end of this form"
            type="warning"
            showIcon
          />
        )}
        <div className="margin-y-large">
          <Field
            name="self-assessment"
            props={{
              onFileLoad: (documentName, document_manager_guid) => {
                onFileLoad(
                  documentName,
                  document_manager_guid,
                  NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
                );
              },
              onRemoveFile,
              mineGuid,
              setUploading,
              allowMultiple: true,
              maxFiles: 1,
              labelIdle:
                '<strong class="filepond--label-action">Self-Assessment Upload</strong><div>Accepted filetypes: .doc .docx .xlsx .pdf</div>',
              acceptedFileTypesMap: { ...DOCUMENT, ...EXCEL },
              uploadType: NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST,
            }}
            component={NoticeOfDepartureFileUpload}
            validate={[required]}
          />
        </div>
        <h4 className="nod-modal-section-header">Upload Application Documents</h4>
        <Typography.Text>
          Please support your Notice of Departure by uploading additional supporting application
          documents. These items documents can include:
        </Typography.Text>
        <ul>
          <li>A detailed project description</li>
          <li>Location (with map, showing Mine boundary)</li>
          <li>Total disturbance area</li>
          <li>Total new disturbance area</li>
          <li>Relevant supporting info (management plans, field surveys, etc...)</li>
        </ul>
        <div className="margin-y-large">
          <Field
            name="other_documents"
            props={{
              onFileLoad: (documentName, document_manager_guid) => {
                onFileLoad(
                  documentName,
                  document_manager_guid,
                  NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.OTHER
                );
              },
              labelIdle:
                '<strong class="filepond--label-action">Supporting Document Upload</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf</div>',
              onRemoveFile: onRemoveFile,
              mineGuid: mineGuid,
              allowMultiple: true,
              setUploading: setUploading,
              acceptedFileTypesMap: {
                ...DOCUMENT,
                ...EXCEL,
                ...SPATIAL,
              },
              uploadType: NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.OTHER,
            }}
            component={NoticeOfDepartureFileUpload}
          />
        </div>
        <div className="ant-modal-footer">
          <Popconfirm
            placement="top"
            title="Are you sure you want to cancel?"
            okText="Yes"
            cancelText="No"
            onConfirm={closeModal}
            disabled={submitting}
          >
            <Button disabled={submitting}>Cancel</Button>
          </Popconfirm>
          <Button
            disabled={submitting || !hasChecklist || uploading}
            type="primary"
            className="full-mobile margin-small"
            htmlType="submit"
          >
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  connect(mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_NOTICE_OF_DEPARTURE,
    onSubmitSuccess: resetForm(FORM.ADD_NOTICE_OF_DEPARTURE),
    initialValues: { nod_contacts: [{ is_primary: true }] },
    touchOnBlur: false,
    forceUnregisterOnUnmount: true,
    enableReinitialize: true,
  })
)(AddNoticeOfDepartureForm) as React.FC<AddNoticeOfDepartureProps>;
