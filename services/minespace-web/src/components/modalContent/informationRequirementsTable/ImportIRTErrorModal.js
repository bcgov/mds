import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import Callout from "@/components/common/Callout";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  errors: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  isBadRequestError: PropTypes.bool.isRequired,
};

export const ImportIRTErrorModal = (props) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const copyErrorToClipboard = (error) => {
    navigator.clipboard.writeText(
      error.map((e) => `Section ${e.section} Row ${e.row_number}`).join("\n")
    );
    setCopySuccess(true);
  };

  const renderErrorSection = (section, errors = []) => {
    let title = null;
    let description = null;
    let errorSection = errors.filter((e) => e.error === section);

    if (section === "INFORMATION_CELL_INVALID") {
      title = "Additional Fields";
      description = "";
    } else if (section === "METHOD_TRUE_NEEDS_COMMENTS") {
      title = "Required fields";
      description = "Comments are required when 'Methods' are checked.";
    }

    if (!errorSection.length) {
      return null;
    }
    return (
      <>
        <h3 style={{ color: "black" }}>
          <b>{title}</b>
        </h3>
        <b>{description}</b>
        <br />
        {errorSection.map((es) => (
          <p>
            Section {e.section} Row {e.row_number}
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
              <b>Warnings</b>
              <p>[GENERIC COPY]</p>
            </>
          }
        />
        {renderErrorSection("METHOD_TRUE_NEEDS_COMMENTS", props.errors)}
        {renderErrorSection("INFORMATION_CELL_INVALID", props.errors)}
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
      <p>{props.errors}</p>
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
