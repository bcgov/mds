import React from "react";
import { notification } from "antd";
import PropTypes from "prop-types";
import { getDocumentDownloadToken } from "@common/utils/actionlessNetworkCalls";
import { DownloadOutlined } from "@ant-design/icons";

const propTypes = {
  submissions: PropTypes.arrayOf(PropTypes.any).isRequired,
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

export const DownloadAllDocuments = (props) => {
  const handleDownloadAll = () => {
    const docURLS = [];

    const totalFiles = props.submissions.length;
    if (totalFiles === 0) {
      return;
    }

    props.submissions.forEach((doc) =>
      getDocumentDownloadToken(doc.documentManagerGuid, doc.filename, docURLS)
    );

    let currentFile = 0;
    waitFor(() => docURLS.length === props.submissions.length).then(async () => {
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
      <button type="button" className="full" onClick={() => handleDownloadAll()}>
        <DownloadOutlined style={{ color: "#5e46a1", paddingLeft: "8px", paddingRight: "22px" }} />
        Download All
      </button>
    </div>
  );
};

export default DownloadAllDocuments;
