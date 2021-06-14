import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Dropdown, Menu } from "antd";
import { DownOutlined, DownloadOutlined, FileOutlined } from "@ant-design/icons";
import LinkButton from "@/components/common/LinkButton";
import { truncateFilename } from "@common/utils/helpers";
import { openDocument, isDocumentOpenable } from "@/components/syncfusion/DocumentViewer";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";

const propTypes = {
  documentManagerGuid: PropTypes.string.isRequired,
  documentName: PropTypes.string.isRequired,
  openDocument: PropTypes.func.isRequired,
  onClickAlternative: PropTypes.func,
  linkTitleOverride: PropTypes.string,
  truncateDocumentName: PropTypes.bool,
};

const defaultProps = {
  onClickAlternative: null,
  linkTitleOverride: null,
  truncateDocumentName: true,
};

const DocumentLink = (props) => {
  const linkTitle = props.linkTitleOverride
    ? props.linkTitleOverride
    : props.truncateDocumentName
    ? truncateFilename(props.documentName)
    : props.documentName;

  const canOpenInDocumentViewer =
    props.documentManagerGuid && isDocumentOpenable(props.documentName);

  const document = {
    document_manager_guid: props.documentManagerGuid,
    document_name: props.documentName,
  };

  const downloadOnClick = props.documentManagerGuid
    ? () => downloadFileFromDocumentManager(document)
    : props.onClickAlternative;

  const openInDocumentViewerOnClick = () =>
    props.documentManagerGuid
      ? props.openDocument(props.documentManagerGuid, props.documentName)
      : null;

  const linkOnClick = openInDocumentViewerOnClick || downloadOnClick;

  const onClickMenu = ({ key }) => {
    return key === "download" ? downloadOnClick() : openInDocumentViewerOnClick();
  };

  return canOpenInDocumentViewer ? (
    <Dropdown
      overlay={
        <Menu onClick={onClickMenu}>
          <Menu.Item key="document-viewer" icon={<FileOutlined />}>
            Open in Document Viewer
          </Menu.Item>
          <Menu.Item key="download" icon={<DownloadOutlined />}>
            Download
          </Menu.Item>
        </Menu>
      }
    >
      <a className="ant-dropdown-link" onClick={linkOnClick}>
        {linkTitle} <DownOutlined />
      </a>
    </Dropdown>
  ) : (
    <LinkButton title={props.documentName} onClick={downloadOnClick}>
      {linkTitle}
    </LinkButton>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openDocument,
    },
    dispatch
  );

DocumentLink.propTypes = propTypes;
DocumentLink.defaultProps = defaultProps;

export default connect(null, mapDispatchToProps)(DocumentLink);
