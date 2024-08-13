import React, { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import FormWrapper from "../../forms/FormWrapper";
import { change, Field, getFormValues, reset, touch } from "redux-form";
import RenderFileUpload from "../../forms/RenderFileUpload";
import { spatialDocumentBundle } from "@mds/common/redux/utils/Validate";
import { OTHER_SPATIAL, SPATIAL_DATA_STANDARDS_URL, XML } from "../../..";
import { Alert, Button, Row, Steps, Typography } from "antd";
import RenderCancelButton from "../../forms/RenderCancelButton";
import RenderSubmitButton from "../../forms/RenderSubmitButton";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import ViewSpatialDetail from "./ViewSpatialDetail";
import { createSpatialBundle } from "@mds/common/redux/slices/spatialDataSlice";

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
  const [isResetting, setIsResetting] = useState(false);

  const handleFileLoad = (document_name, document_manager_guid, version) => {
    const fileData = { document_name, document_manager_guid, version };
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

  const filesHaveGeomarkIds = () => {
    return existingDocuments.some((d) => d.geomark_id);
  };

  const stepContent = [
    {
      title: "Upload Spatial Data Files",
      content: (
        <>
          <Typography.Title level={3}>Upload Spatial Bundle</Typography.Title>
          <Typography.Paragraph>
            You can only submit one KML, KMZ, or Shapefile at a time.
          </Typography.Paragraph>
          <Typography.Paragraph>
            <Alert
              type="info"
              showIcon
              description={
                <>
                  Visit <Link to={SPATIAL_DATA_STANDARDS_URL}>GIS Shapefile Standards</Link> to
                  learn more about shapefile requirements and standards.
                </>
              }
            />
          </Typography.Paragraph>
          <Typography.Title level={4}>Spatial Data</Typography.Title>
          <Typography.Paragraph>
            Shapefile component files must include the .shp, .shx, .dbf, and .prj files with the
            same filename prefix.
          </Typography.Paragraph>
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
          {filesHaveGeomarkIds() && <ViewSpatialDetail spatialDocuments={existingDocuments} />}
        </>
      ),
    },
  ];

  const addBundleIdToFiles = ({
    docman_bundle_guid,
    geomark_id,
  }: {
    docman_bundle_guid: string;
    geomark_id: string;
  }) => {
    const newFiles = currentValues[fieldName].map((f) => {
      return {
        ...f,
        docman_bundle_guid,
        geomark_id,
      };
    });
    dispatch(change(modalFormName, fieldName, [...initialDocuments, ...newFiles]));
  };

  const handleSubmit = async (values) => {
    const isFinalStep = currentStep === stepContent.length - 1;
    const newFiles = values[fieldName];
    if (isFinalStep) {
      dispatch(change(formName, fieldName, [...initialDocuments, ...newFiles]));
      setIsResetting(true);
      setCurrentStep(0);
      await dispatch(reset(modalFormName));
      setIsResetting(false);
    } else {
      const bundle_document_guids = newFiles.map((f) => f.document_manager_guid);
      const name = newFiles[0].document_name.split(".")[0];
      const resp = await dispatch(createSpatialBundle({ name, bundle_document_guids }));
      if (resp.payload) {
        addBundleIdToFiles(resp.payload);
        setCurrentStep(currentStep + 1);
      }
    }
  };

  return (
    <FormWrapper
      isModal
      name={modalFormName}
      onSubmit={handleSubmit}
      reduxFormConfig={{
        touchOnChange: true,
      }}
    >
      <Steps current={currentStep} items={stepContent}></Steps>
      {stepContent[currentStep].content}
      {/* hide the input between steps rather than re-render, to keep file data */}
      {!isResetting && (
        <div className={currentStep !== 0 ? "hidden" : undefined}>
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
      )}
      <Row justify="end">
        <RenderCancelButton />
        {currentStep + 1 < stepContent.length ? (
          <RenderSubmitButton buttonText="Continue" />
        ) : (
          <>
            <Button onClick={() => setCurrentStep(0)}>Back</Button>
            <RenderSubmitButton buttonText="Upload Another" buttonProps={{ type: "ghost" }} />
            <RenderSubmitButton
              buttonText="Confirm"
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
