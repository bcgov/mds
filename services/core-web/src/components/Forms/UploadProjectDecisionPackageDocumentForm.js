import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { Field, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { Col, Row, Typography, Divider, Checkbox } from "antd";
import * as FORM from "@/constants/forms";
import ProjectDecisionPackageFileUpload from "@/components/mine/Projects/ProjectDecisionPackageFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";

const propTypes = {
  projectGuid: PropTypes.string.isRequired,
  contentTitle: PropTypes.string.isRequired,
  instructions: PropTypes.string.isRequired,
  modalType: PropTypes.string.isRequired,
  initialValues: PropTypes.any,
  isModal: PropTypes.bool,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired
};

export const UploadProjectDecisionPackageDocumentForm = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [addFilesToDecisionPackage, setAddFilesToDecisionPackage] = useState(false);
  const isDecisionPackageEligible = props.modalType === "upload-document";
  const formName = FORM.UPDATE_PROJECT_DECISION_PACKAGE_DOCUMENT;

  const onFileLoad = (fileName, document_manager_guid) => {
    setUploadedFiles([
      ...uploadedFiles,
      {
        document_name: fileName,
        document_manager_guid,
      },
    ]);
  };

  const onRemoveFile = (err, fileItem) => {
    if (err) {
      console.log(err);
    }

    if (fileItem.serverId) {
      setUploadedFiles(
        uploadedFiles.filter((file) => file.document_manager_guid !== fileItem.serverId)
      );
    }
  };

  useEffect(() => {
    props.change(formName, "uploadedFiles", uploadedFiles);
  }, [uploadedFiles]);

  return (
    <FormWrapper
      initialValues={props.initialValues}
      isModal={props.isModal}
      name={FORM.UPDATE_PROJECT_DECISION_PACKAGE_DOCUMENT}
      onSubmit={(values) => props.onSubmit(values?.uploadedFiles, {
        addFilesToDecisionPackage,
        isDecisionPackageEligible,
      })}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
    >
      <Row gutter={16}>
        <Col>
          <Typography.Title level={4}>{props.contentTitle}</Typography.Title>
          <Typography.Text>{props.instructions}</Typography.Text>
          <br />
          <br />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="uploadedFiles"
            name="uploadedFiles"
            onFileLoad={onFileLoad}
            onRemoveFile={onRemoveFile}
            projectGuid={props.projectGuid}
            component={ProjectDecisionPackageFileUpload}
          />
        </Col>
      </Row>
      {isDecisionPackageEligible && (
        <Row>
          <Col>
            <Divider />
            <Checkbox
              checked={addFilesToDecisionPackage}
              onChange={() => setAddFilesToDecisionPackage(!addFilesToDecisionPackage)}
            >
              These files are to be added to the decision package
            </Checkbox>
          </Col>
        </Row>
      )}
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText="Update" buttonProps={{ disabled: props?.formValues?.uploadedFiles?.length === 0 }} />
      </div>
    </FormWrapper>
  );
};

UploadProjectDecisionPackageDocumentForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.UPDATE_PROJECT_DECISION_PACKAGE_DOCUMENT)(state) || {},
});

export default compose(
  connect(mapStateToProps)
)(UploadProjectDecisionPackageDocumentForm);
