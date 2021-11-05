import React from "react";
import { notification } from "antd";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { getDocumentDownloadToken } from "@common/utils/actionlessNetworkCalls";
import { DownloadOutlined } from "@ant-design/icons";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument).isRequired,
};

const downloadDocument = (url) => {
  const a = document.createElement("a");
  a.href = url.url;
  a.download = url.filename;
  a.style.display = "none";
  document.body.append(a);
  a.click();
  a.remove();
};

const waitFor = (conditionFunction) => {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 400);
  };

  return new Promise(poll);
};

export const DownloadAllDocumentsButton = (props) => {
  const hasDocuments = props.documents?.length > 0;

  const handleDownloadAll = () => {
    const docURLS = [];

    const totalFiles = props.documents.length;
    if (totalFiles === 0) {
      return;
    }

    props.documents.forEach((doc) =>
      getDocumentDownloadToken(doc.documentManagerGuid, doc.filename, docURLS)
    );

    let currentFile = 0;
    waitFor(() => docURLS.length === props.documents.length).then(async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const url of docURLS) {
        currentFile += 1;

        downloadDocument(url);

        // eslint-disable-next-line
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      notification.success({
        message: `Successfully Downloaded: ${totalFiles} files.`,
        duration: 10,
      });
    });
  };
  return (
    <div className="custom-menu-item">
      <button
        type="button"
        className="full add-permit-dropdown-button"
        disabled={!hasDocuments}
        onClick={() => handleDownloadAll()}
      >
        <DownloadOutlined className="icon-sm padding-md--right violet" />
        Download All
      </button>
    </div>
  );
};

DownloadAllDocumentsButton.propTypes = propTypes;
export default DownloadAllDocumentsButton;
