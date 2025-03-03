import React, { FC, useEffect, useState } from "react";
import { change, Field } from "@mds/common/components/forms/form";
import { Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import { dateNotInFuture, maxLength, protocol, required } from "@mds/common/redux/utils/Validate";
import {
  getDropdownNoticeOfWorkApplicationDocumentTypeOptions,
  getNoticeOfWorkApplicationDocumentTypeOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { NOTICE_OF_WORK_DOCUMENT } from "@mds/common/constants/API";
import {
  ADVERTISEMENT,
  ADVERTISEMENT_DOC,
  CONSULTATION_TAB_CODE,
  PUBLIC_COMMENT,
  REFERRAL_CODE,
} from "@/constants/NOWConditions";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import FileUpload from "@mds/common/components/forms/RenderFileUpload";
import UploadedDocumentsTable from "@/components/common/UploadedDocumentTable";

interface NOWReviewFormProps {
  onSubmit: (values) => void;
  handleDocumentDelete: Function;
  initialValues: any;
  type: string;
  categoriesToShow: Array<string>;
}

export const NOWReviewForm: FC<NOWReviewFormProps> = ({
  onSubmit,
  handleDocumentDelete,
  initialValues,
  type,
  categoriesToShow,
}) => {
  const dispatch = useAppDispatch();

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);

  const documentTypeOptions = useAppSelector(getDropdownNoticeOfWorkApplicationDocumentTypeOptions);
  const documentTypeOptionsHash = useAppSelector(getNoticeOfWorkApplicationDocumentTypeOptionsHash);

  const formName = FORM.ADD_NOW_REVIEW;

  useEffect(() => {
    setExistingDocuments(initialValues.documents);
  }, [initialValues]);

  const onFileLoad = async (fileName: string, document_manager_guid: string) => {
    const newUploadedFiles = [
      ...uploadedFiles,
      {
        document_name: fileName,
        document_manager_guid,
      },
    ];

    setUploadedFiles(newUploadedFiles);
    dispatch(change(formName, "uploadedFiles", newUploadedFiles));
  };

  const onRemoveFile = (err, fileItem) => {
    const newUploadedFiles = uploadedFiles.filter((doc) => doc[0] !== fileItem.serverId);
    setUploadedFiles(newUploadedFiles);
    dispatch(change(formName, "uploadedFiles", newUploadedFiles));
  };

  const filteredDropDownOptions = documentTypeOptions.filter(({ subType, value }) => {
    if (type === PUBLIC_COMMENT) {
      return categoriesToShow.includes(subType) && value !== ADVERTISEMENT_DOC;
    }
    return categoriesToShow.includes(subType);
  });

  return (
    <FormWrapper
      onSubmit={onSubmit}
      isModal
      initialValues={initialValues}
      name={FORM.ADD_NOW_REVIEW}
      reduxFormConfig={{
        touchOnBlur: false,
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          {type === REFERRAL_CODE && (
            <>
              <Field
                id="referral_number"
                name="referral_number"
                label="E-Referral Number"
                component={RenderField}
                validate={[maxLength(16)]}
              />
              <Field
                id="response_date"
                name="response_date"
                label="Date Received"
                component={RenderDate}
                validate={[dateNotInFuture]}
              />
            </>
          )}

          {type === CONSULTATION_TAB_CODE && (
            <>
              <Field
                id="response_url"
                name="response_url"
                label="Link to First Nations Consultation System (FNCS)"
                component={RenderField}
                validate={[protocol]}
              />
              <Field
                id="referee_name"
                name="referee_name"
                label="First Nations Advisor"
                component={RenderField}
              />
              <Field
                id="response_date"
                name="response_date"
                label="Date Received"
                component={RenderDate}
                validate={[dateNotInFuture]}
              />
            </>
          )}

          {type === ADVERTISEMENT && (
            <Field
              id="response_date"
              name="response_date"
              label="Date Published"
              component={RenderDate}
              required
              validate={[required, dateNotInFuture]}
            />
          )}

          {type === PUBLIC_COMMENT && (
            <>
              <Field
                id="referee_name"
                name="referee_name"
                label="Commenter Name"
                component={RenderField}
              />
              <Field
                id="response_date"
                name="response_date"
                label="Response Date"
                component={RenderDate}
                required
                validate={[required, dateNotInFuture]}
              />
            </>
          )}
          <br />
          <h5>Document Upload</h5>
          {type !== ADVERTISEMENT && (
            <p className="p-light">
              All files uploaded will be classified using the selected Category. To upload other
              file types, re-open this form after submitting the current files.
            </p>
          )}
          <br />
          <Field
            id="now_application_document_type_code"
            name="now_application_document_type_code"
            label="Document Category"
            component={RenderSelect}
            disabled={type === ADVERTISEMENT}
            data={filteredDropDownOptions}
            required={uploadedFiles.length > 0}
            validate={uploadedFiles.length > 0 ? [required] : []}
          />
          <Field
            id="NOWReviewFileUpload"
            name="NOWReviewFileUpload"
            onFileLoad={onFileLoad}
            onRemoveFile={onRemoveFile}
            uploadUrl={NOTICE_OF_WORK_DOCUMENT(initialValues.now_application_guid)}
            component={FileUpload}
            allowRevert
            allowMultiple
          />
          {existingDocuments && existingDocuments.length > 0 && (
            <UploadedDocumentsTable
              showCategory
              documentTypeOptionsHash={documentTypeOptionsHash}
              files={existingDocuments
                .filter((doc) => doc.mine_document?.mine_document_guid)
                .map((doc) => ({
                  now_application_document_type_code: doc.now_application_document_type_code,
                  ...doc.mine_document,
                }))}
              showRemove
              removeFileHandler={(doc_guid) => {
                handleDocumentDelete(doc_guid);
                setExistingDocuments(
                  existingDocuments.filter((doc) => doc.mine_document_guid !== doc_guid)
                );
              }}
            />
          )}
        </Col>
      </Row>
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText="Save" disableOnClean={false} />
      </div>
    </FormWrapper>
  );
};

export default NOWReviewForm;
