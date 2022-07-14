import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import Callout from "@/components/common/Callout";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  errors: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)),
};

export const ImportIRTErrorModal = (props) => {
  const copyErrorToClipboard = (error) => {
    navigator.clipboard.writeText(
      error.map((e) => `Section ${e.section} Row ${e.row_number}`).join("\n")
    );
    setCopySuccess(true);
  };
  const [copySuccess, setCopySuccess] = useState(false);

  return (
    <div>
      <Callout
        style={{ marginTop: 0 }}
        severity="warning"
        message={
          <>
            <b>Warnings</b>
            <p>
              "Comments" fields required when "Methods" or "Required" are checked. Please update and
              import again.
            </p>
          </>
        }
      />
      <h3 style={{ color: "black" }}>
        <b>Required sections</b>
      </h3>
      <b>Check below section row number(s) on your IRT file.</b>
      {props.errors &&
        props.errors?.map((e) => (
          <p>
            Section {e.section} Row {e.row_number}
          </p>
        ))}
      <br />
      <div className="ant-modal-footer">
        <Button
          type="secondary"
          style={{ float: "left" }}
          onClick={(e) => copyErrorToClipboard(props.errors)}
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
};

ImportIRTErrorModal.propTypes = propTypes;

export default ImportIRTErrorModal;
