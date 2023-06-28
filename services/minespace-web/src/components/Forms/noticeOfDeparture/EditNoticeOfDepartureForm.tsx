import React, { useEffect, useState } from "react";
import {
  change,
  Field,
  FieldArray,
  getFormSyncErrors,
  InjectedFormProps,
  reduxForm,
} from "redux-form";
import { Alert, Button, Col, Popconfirm, Row, Typography } from "antd";
import { Form } from "@ant-design/compatible";
import { maxLength, required, requiredRadioButton } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import {
  NOD_TYPE_FIELD_VALUE,
  NOTICE_OF_DEPARTURE_DOCUMENT_TYPE,
  NOTICE_OF_DEPARTURE_STATUS_VALUES,
} from "@common/constants/strings";
import { getNoticeOfDeparture } from "@common/reducers/noticeOfDepartureReducer";
import { DOCUMENT, EXCEL, SPATIAL } from "@common/constants/fileTypes";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import NoticeOfDepartureFileUpload from "@/components/Forms/noticeOfDeparture/NoticeOfDepartureFileUpload";
import { EMPTY_FIELD } from "@/constants/strings";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import { documentSection } from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDepartureDetails";
import NoticeOfDepartureCallout from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDepartureCallout";
import { renderContacts } from "@/components/Forms/noticeOfDeparture/AddNoticeOfDepartureForm";
import { ICreateNoD, INodDocumentPayload, INoticeOfDeparture } from "@mds/common";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";

interface EditNoticeOfDepartureFormProps {
  initialValues: INoticeOfDeparture;
  onSubmit: (nod_guid: string, values: any, documentArray: INodDocumentPayload) => any;
  closeModal: () => void;
  mineGuid: string;
  noticeOfDeparture: INoticeOfDeparture;
  handleSubmit?: any;
  logFormErrors?: any;
  pristine?: boolean;
  change?: (field: string, value: any) => void;
}

const EditNoticeOfDepartureForm: React.FC<InjectedFormProps<Partial<ICreateNoD>> &
  EditNoticeOfDepartureFormProps> = (props) => {
  const { onSubmit, closeModal, handleSubmit, mineGuid, noticeOfDeparture, pristine } = props;
  const { permit, nod_guid, nod_no, nod_status } = noticeOfDeparture;
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [documentArray, setDocumentArray] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [hasChecklist, setHasChecklist] = useState(false);

  const checklist = noticeOfDeparture.documents.find(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
  );

  const otherDocuments = noticeOfDeparture.documents.filter(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.OTHER
  );

  const decision = noticeOfDeparture.documents.filter(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.DECISION
  );

  useEffect(() => {
    if (checklist) {
      setHasChecklist(true);
    }
  }, [checklist]);

  const handleNoticeOfDepartureSubmit = (values): any => {
    setSubmitting(true);
    onSubmit(nod_guid, values, documentArray).finally(() => setSubmitting(false));
  };

  const onFileLoad = (documentName, document_manager_guid, documentType) => {
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
      props.change("self-assessment", documentName);
      setHasChecklist(true);
    }
  };

  useEffect(() => {
    props.change("uploadedFiles", documentArray);
  }, [documentArray]);

  const onRemoveFile = (_, fileItem) => {
    const removedDoc = documentArray.find((doc) => doc.document_manager_guid === fileItem.serverId);
    if (removedDoc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST) {
      setHasChecklist(false);
      props.change("self-assessment", null);
    }
    setDocumentArray(
      documentArray.filter((document) => document.document_manager_guid !== fileItem.serverId)
    );
    setUploadedFiles(
      uploadedFiles.filter((file) => file.document_manager_guid !== fileItem.serverId)
    );
    setUploading(false);
  };
  const handleWithdraw = () => {
    onSubmit(
      nod_guid,
      { ...noticeOfDeparture, nod_status: NOTICE_OF_DEPARTURE_STATUS_VALUES.withdrawn },
      []
    ).finally(() => setSubmitting(false));
  };

  const handleBeforeUpload = () => {
    if (checklist) {
      // eslint-disable-next-line no-alert
      return window.confirm(
        "Uploading a new checklist will replace the previously uploaded file.  Are you sure you'd like to continue?"
      );
    }
    return true;
  };

  return (
    <div>
      <NoticeOfDepartureCallout nodStatus={nod_status} />
      <Form layout="vertical" onSubmit={handleSubmit(handleNoticeOfDepartureSubmit)}>
        <Typography.Title level={4}>Basic Information</Typography.Title>
        <Typography.Text>
          Enter the following information about your Notice of Departure.
        </Typography.Text>
        <Field
          label="Project Title"
          id="nodTitle"
          name="nod_title"
          component={renderConfig.FIELD}
          validate={[required, maxLength(50)]}
        />
        <Row gutter={24}>
          <Col span={12}>
            <p className="field-title">Permit #</p>
            <p className="content--light-grey padding-sm">{permit.permit_no || EMPTY_FIELD}</p>
          </Col>
          <Col span={12}>
            <p className="field-title">NOD #</p>
            <p className="content--light-grey padding-sm">{nod_no || EMPTY_FIELD}</p>
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
          <a
            href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/mines-act-permits/mines-act-departures-from-approval"
            target="_blank"
            rel="noopener noreferrer"
          >
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
            onFileLoad={(documentName, document_manager_guid) => {
              onFileLoad(
                documentName,
                document_manager_guid,
                NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
              );
            }}
            onRemoveFile={onRemoveFile}
            mineGuid={mineGuid}
            allowMultiple
            setUploading={setUploading}
            beforeUpload={handleBeforeUpload}
            component={NoticeOfDepartureFileUpload}
            labelIdle='<strong class="filepond--label-action">Self-Assessment Upload</strong><div>Accepted filetypes: .doc .docx .xlsx .pdf</div>'
            maxFiles={1}
            acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
            uploadType={NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST}
          />
        </div>
        {checklist && documentSection({ title: "", documentArray: [checklist] })}

        <h4 className="nod-modal-section-header">Upload Application Documents</h4>
        <Typography.Text className="">
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
                '<strong class="filepond--label-action">Drag & drop your files or Browse</strong><div>Accepted filetypes: .kmz .doc .docx .xlsx .pdf</div>',
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
        {otherDocuments.length > 0 && documentSection({ title: "", documentArray: otherDocuments })}
        {decision.length > 0 &&
          documentSection({
            title: "Ministry Decision Documentation",
            documentArray: decision,
          })}
        {nod_status === NOTICE_OF_DEPARTURE_STATUS_VALUES.pending_review && (
          <div className="content--light-grey padding-lg margin-large--bottom">
            <h4 className="nod-modal-section-header">Withdraw Submission</h4>
            <Typography.Text>
              If you would like to withdraw this submission you may do so by clicking below. If you
              choose to submit this Notice of Departure again you will need to begin a new
              submission.
            </Typography.Text>
            <div className="margin-y-large">
              <Popconfirm
                title="Are you sure you want to withdraw this Notice of Departure?"
                placement="top"
                okText="Yes"
                cancelText="No"
                onConfirm={handleWithdraw}
              >
                <Button type="primary" className="full-mobile">
                  Withdraw Submission
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}

        <div className="ant-modal-footer">
          <Popconfirm
            placement="top"
            title="Are you sure you want to cancel?"
            okText="Yes"
            cancelText="No"
            onConfirm={closeModal}
          >
            <Button disabled={submitting}>Cancel</Button>
          </Popconfirm>
          <Button
            disabled={
              submitting || uploading || (pristine && documentArray.length === 0) || !hasChecklist
            }
            type="primary"
            className="full-mobile margin-small"
            htmlType="submit"
          >
            Submit Notice of Departure
          </Button>
        </div>
      </Form>
    </div>
  );
};

const mapStateToProps = (state) => ({
  initialValues: getNoticeOfDeparture(state),
  logFormErrors: getFormSyncErrors(FORM.EDIT_NOTICE_OF_DEPARTURE)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.EDIT_NOTICE_OF_DEPARTURE,
    onSubmitSuccess: resetForm(FORM.EDIT_NOTICE_OF_DEPARTURE),
    touchOnBlur: false,
    forceUnregisterOnUnmount: true,
    enableReinitialize: true,
  })
)(EditNoticeOfDepartureForm) as React.FC<EditNoticeOfDepartureFormProps>;
