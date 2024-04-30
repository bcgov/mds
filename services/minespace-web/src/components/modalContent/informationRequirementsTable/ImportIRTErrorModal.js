import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import Callout from "@/components/common/Callout";

const METHOD_TRUE_NEED_COMMENTS = "METHOD_TRUE_NEED_COMMENTS";
const INFORMATION_CELL_INVALID = "INFORMATION_CELL_INVALID";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  errors: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  isBadRequestError: PropTypes.bool.isRequired,
};

export const ImportIRTErrorModal = (props) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const copyErrorToClipboard = (errors) => {
    const informationCellInvalidErrors = errors.filter((e) => e.error === INFORMATION_CELL_INVALID);
    const informationCellErrorMapMessage = informationCellInvalidErrors
      .map((e) => `Section ${e.section} Row ${e.row_number}`)
      .join("\n");
    const commentsNeededErrors = errors.filter((e) => e.error === METHOD_TRUE_NEED_COMMENTS);
    const commentsNeededErrorMapMessage = commentsNeededErrors
      .map((e) => `Section ${e.section} Row ${e.row_number}`)
      .join("\n");
    const commentsNeededFormattedError = commentsNeededErrors.length
      ? `Required fields - Comments are required when the 'Methods' field is checked:\n\n${commentsNeededErrorMapMessage}`
      : "";
    let informationCellFormattedError = informationCellInvalidErrors.length
      ? `Unexpected fields - The following rows do not match our template and may have been modified:\n\n${informationCellErrorMapMessage}`
      : "";
    if (informationCellInvalidErrors.length && commentsNeededErrors.length) {
      informationCellFormattedError = `\n\n${informationCellFormattedError}`;
    }
    const formattedErrorMessage = commentsNeededFormattedError + informationCellFormattedError;

    navigator.clipboard.writeText(formattedErrorMessage);
    setCopySuccess(true);
  };

  const renderErrorSection = (section, errors = []) => {
    let title = null;
    let description = null;
    const errorSection = errors.filter((e) => e.error === section);

    if (section === INFORMATION_CELL_INVALID) {
      title = "Unexpected fields";
      description = "The following rows do not match our template and may have been modified.";
    } else if (section === METHOD_TRUE_NEED_COMMENTS) {
      title = "Required fields";
      description = "Comments are required when the 'Methods' field is checked.";
    }

    if (errorSection.length === 0) {
      return null;
    }
    return (
      <>
        <h3 style={{ color: "black" }}>
          <b>{title}</b>
        </h3>
        <b>{description}</b>
        <br />
        {errorSection.map((es, index) => (
          <p key={index}>
            Section {es.section} Row {es.row_number}
          </p>
        ))}
      </>
    );
  };

  if (props.isBadRequestError) {
    return (
      <div>
        <Callout
          style={{ marginTop: 0 }}
          severity="warning"
          message={
            <>
              <b>Import Error</b>
              <p>
                We found one or more error(s) during import of your Information Requirements Table
                (IRT) file. Please review the errors below and submit your file again.
              </p>
            </>
          }
        />
        {renderErrorSection(METHOD_TRUE_NEED_COMMENTS, props.errors)}
        {renderErrorSection(INFORMATION_CELL_INVALID, props.errors)}
        <br />
        <div className="ant-modal-footer">
          <Button
            type="secondary"
            style={{ float: "left" }}
            onClick={() => copyErrorToClipboard(props.errors)}
          >
            Copy list to clipboard
          </Button>
          {copySuccess && (
            <p style={{ color: "red", float: "left", paddingLeft: "5px" }}>Copied to clipboard.</p>
          )}
          <Button type="primary" onClick={props.closeModal}>
            Close
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="ant-modal-footer">
        <Button type="primary" onClick={props.closeModal}>
          Close
        </Button>
      </div>
    </div>
  );
};

ImportIRTErrorModal.propTypes = propTypes;

export default ImportIRTErrorModal;
