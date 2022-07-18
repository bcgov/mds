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

  if (props.isBadRequestError) {
    return (
      <div>
        <Callout
          style={{ marginTop: 0 }}
          severity="warning"
          message={
            <>
              <b>Warnings</b>
              <p>
                {`"Comments" fields required when "Methods" or "Required" are checked. Please update
                and import again.`}
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
