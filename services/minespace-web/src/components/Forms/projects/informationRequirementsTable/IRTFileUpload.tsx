import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { INFORMATION_REQUIREMENTS_TABLE_DOCUMENTS } from "@mds/common/constants/API";
import RenderFileUpload from "@mds/common/components/forms/RenderFileUpload";
import { MAX_DOCUMENT_NAME_LENGTHS } from "@mds/common";
import { requiredNewFiles } from "@mds/common/redux/utils/Validate";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  importIsSuccessful: PropTypes.func.isRequired,
  createInformationRequirementsTable: PropTypes.func.isRequired,
  updateInformationRequirementsTable: PropTypes.func.isRequired,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string).isRequired,
  irtGuid: PropTypes.string.isRequired,
  projectGuid: PropTypes.string.isRequired,
};

export const IRTFileUpload = ({ input, ...props }) => {
  return (
    <Field
      id={input.name}
      name={input.name}
      component={RenderFileUpload}
      abbrevLabel={true}
      maxFileNameLength={MAX_DOCUMENT_NAME_LENGTHS.MAJOR_PROJECTS}
      label="Upload Files"
      uploadUrl={INFORMATION_REQUIREMENTS_TABLE_DOCUMENTS(props.projectGuid)}
      acceptedFileTypesMap={props.acceptedFileTypesMap}
      onFileLoad={props.onFileLoad}
      onRemoveFile={props.onRemoveFile}
      importIsSuccessful={props.importIsSuccessful}
      required
      validate={[requiredNewFiles]}
      allowRevert
      maxFiles={1}
      afterSuccess={{
        action: [
          props.createInformationRequirementsTable,
          props.updateInformationRequirementsTable,
        ],
        projectGuid: props.projectGuid,
        irtGuid: props.irtGuid,
      }}
    />
  );
};

IRTFileUpload.propTypes = propTypes;

export default IRTFileUpload;
