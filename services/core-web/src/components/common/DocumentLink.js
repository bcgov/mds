import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Dropdown, Menu } from "antd";
import { DownOutlined, DownloadOutlined, FileOutlined, DeleteOutlined } from "@ant-design/icons";
import LinkButton from "@/components/common/buttons/LinkButton";
import { truncateFilename } from "@common/utils/helpers";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import { openDocument, isDocumentOpenable } from "@/components/syncfusion/DocumentViewer";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { USER_ROLES } from "@mds/common";

const propTypes = {
  documentManagerGuid: PropTypes.string.isRequired,
  documentName: PropTypes.string.isRequired,
  openDocument: PropTypes.func.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClickAlternative: PropTypes.func,
  linkTitleOverride: PropTypes.string,
  truncateDocumentName: PropTypes.bool,
  deletePermission: PropTypes.string,
  handleDelete: PropTypes.func,
  deleteFilePayload: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  onClickAlternative: null,
  linkTitleOverride: null,
  truncateDocumentName: true,
  deletePermission: null,
  deleteFilePayload: {},
  handleDelete: () => {},
};

export const DocumentLink = (props) => {
  const linkTitle = () => {
    if (props.linkTitleOverride) {
      return props.linkTitleOverride;
    }
    if (props.truncateDocumentName) {
      return truncateFilename(props.documentName);
    }
    return props.documentName;
  };

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

  const canDeleteFile =
    props.deletePermission && props.userRoles.includes(USER_ROLES[props.deletePermission]);

  const onClickMenu = (event) => {
    switch (event.key) {
      case "download":
        return downloadOnClick();
      case "document-viewer":
        return openInDocumentViewerOnClick();
      case "delete":
        return props.handleDelete(event?.domEvent, props?.deleteFilePayload);
      default:
        return openInDocumentViewerOnClick();
    }
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
          {canDeleteFile && (
            <Menu.Item key="delete" icon={<DeleteOutlined />}>
              Delete
            </Menu.Item>
          )}
        </Menu>
      }
    >
      <a
        className="ant-dropdown-link"
        role="button"
        onClick={linkOnClick}
        onKeyDown={linkOnClick}
        tabIndex={0}
      >
        {linkTitle()} <DownOutlined />
      </a>
    </Dropdown>
  ) : (
    <LinkButton title={props.documentName} onClick={downloadOnClick}>
      {linkTitle()}
    </LinkButton>
  );
};

const mapStateToProps = (state) => ({
  userRoles: getUserAccessData(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openDocument,
    },
    dispatch
  );

DocumentLink.propTypes = propTypes;
DocumentLink.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(DocumentLink);
