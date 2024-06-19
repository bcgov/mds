import React, { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FormWrapper, { FormWrapperProps } from "../../forms/FormWrapper";
import { change, Field, getFormValues, reset, touch } from "redux-form";
import RenderFileUpload from "../../forms/RenderFileUpload";
import { spatialDocumentBundle } from "@mds/common/redux/utils/Validate";
import { OTHER_SPATIAL, XML } from "../../..";
import { Alert, Button, Row, Steps, Typography } from "antd";
import RenderCancelButton from "../../forms/RenderCancelButton";
import RenderSubmitButton from "../../forms/RenderSubmitButton";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import ViewSpatialDetail from "./ViewSpatialDetail";

interface AddSpatialDocumentsModalProps {
  formName: string;
  fieldName: string;
  uploadUrl: string;
  transformFile?: (file) => any;
}

const AddSpatialDocumentsModal: FC<AddSpatialDocumentsModalProps> = ({
  formName,
  fieldName,
  uploadUrl,
  transformFile,
}) => {
  const dispatch = useDispatch();
  const initialValues = useSelector(getFormValues(formName));
  const initialDocuments = initialValues[fieldName] ?? [];

  const modalFormName = `${formName}_${fieldName}`;
  const currentValues = useSelector(getFormValues(modalFormName));
  const existingDocuments = currentValues ? currentValues[fieldName] : [];
  const spatialAcceptedFileTypesMap = {
    ...OTHER_SPATIAL,
    ...XML,
  };

  const [currentStep, setCurrentStep] = useState(0);

  const handleFileLoad = (document_name, document_manager_guid, version, fileInfo) => {
    // console.log('docName, docManGuid, version', document_name, document_manager_guid, version, fileInfo);
    const fileData = { document_name, document_manager_guid, version, size: fileInfo.size };
    const newUploadedFiles = [
      ...existingDocuments,
      transformFile ? transformFile(fileData) : fileData,
    ];
    dispatch(change(modalFormName, fieldName, newUploadedFiles));
    dispatch(touch(modalFormName, fieldName));
  };

  const handleRemoveFile = (err, fileItem) => {
    const newUploadedFiles = existingDocuments.filter(
      (doc) => doc.document_manager_guid !== fileItem.serverId
    );
    dispatch(change(modalFormName, fieldName, newUploadedFiles));
  };

  const stepContent = [
    {
      title: "Upload Spatial Data",
      content: (
        <>
          <Typography.Title level={3}>Upload Bundle</Typography.Title>
          <Typography.Paragraph>Upload one bundle of shapefiles at a time.</Typography.Paragraph>
          <Alert
            type="info"
            showIcon
            description={
              <>
                Visit <a href="www.google.ca">GIS Shapefile Standards</a> to learn more about
                shapefile requirements and standards.
              </>
            }
          />
        </>
      ),
    },
    {
      title: "Review",
      content: (
        <>
          <Typography.Title level={3}>Review Map</Typography.Title>
          <Typography.Paragraph>
            Please confirm that the composed map below correctly represents your selected spatial
            data files.
          </Typography.Paragraph>
          <ViewSpatialDetail spatialBundle={existingDocuments} />
        </>
      ),
    },
  ];

  const isFinalStep = currentStep === stepContent.length - 1;

  return (
    <FormWrapper
      isModal
      name={modalFormName}
      initialValues={{
        [fieldName]: initialDocuments,
      }}
      onSubmit={(values) => {
        const fileValues = values[fieldName];
        if (isFinalStep) {
          dispatch(change(formName, fieldName, fileValues));
          setCurrentStep(0);
          dispatch(reset(modalFormName));
        } else {
          setCurrentStep(currentStep + 1);
        }
      }}
      reduxFormConfig={{
        touchOnChange: true,
      }}
    >
      <Steps current={currentStep} items={stepContent}></Steps>
      {stepContent[currentStep].content}
      {/* hide the input between steps rather than re-render, to keep file data */}
      <div className={currentStep !== 0 && "hidden"}>
        <Field
          name={fieldName}
          onFileLoad={handleFileLoad}
          onRemoveFile={handleRemoveFile}
          component={RenderFileUpload}
          maxFileSize="400MB"
          label="Upload shapefiles"
          abbrevLabel
          listedFileTypes={["spatial"]}
          required
          validate={[spatialDocumentBundle]}
          uploadUrl={uploadUrl}
          allowRevert
          acceptedFileTypesMap={spatialAcceptedFileTypesMap}
        />
      </div>
      <Row justify="end">
        <RenderCancelButton />
        {currentStep + 1 < stepContent.length ? (
          <RenderSubmitButton buttonText="Continue" />
        ) : (
          <>
            <Button onClick={() => setCurrentStep(0)}>Back</Button>
            <RenderSubmitButton
              buttonText="Save & Upload Another"
              buttonProps={{ type: "ghost" }}
            />
            <RenderSubmitButton
              buttonText="Save & Close"
              buttonProps={{
                onClick: () => {
                  dispatch(closeModal());
                },
              }}
            />
          </>
        )}
      </Row>
    </FormWrapper>
  );
};

export default AddSpatialDocumentsModal;
