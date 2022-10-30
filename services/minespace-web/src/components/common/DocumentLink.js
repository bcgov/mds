import React from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Dropdown, Menu } from "antd";
import { DownOutlined, DownloadOutlined, FileOutlined, DeleteOutlined } from "@ant-design/icons";
import { truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common";
import { openDocument, isDocumentOpenable } from "@/components/syncfusion/DocumentViewer";

const propTypes = {
  documentManagerGuid: PropTypes.string.isRequired,
  documentName: PropTypes.string.isRequired,
  openDocument: PropTypes.func.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClickAlternative: PropTypes.func,
  linkTitleOverride: PropTypes.string,
  truncateDocumentName: PropTypes.bool,
  handleDelete: PropTypes.func,
  deletePayload: PropTypes.objectOf(PropTypes.string),
  deletePermission: PropTypes.oneOf([PropTypes.string, PropTypes.bool]),
};

const defaultProps = {
  onClickAlternative: null,
  linkTitleOverride: null,
  truncateDocumentName: true,
  handleDelete: () => {},
  deletePayload: {},
  deletePermission: false,
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
    (typeof props?.deletePermission === "boolean" && props.deletePermission) ||
    props.userRoles.includes(USER_ROLES[props?.deletePermission]);

  const onClickMenu = (event) => {
    switch (event.key) {
      case "download":
        return downloadOnClick();
      case "document-viewer":
        return openInDocumentViewerOnClick();
      case "delete":
        return props.handleDelete(props?.deletePayload);
      default:
        return openInDocumentViewerOnClick();
    }
  };

  return (
    <Dropdown
      overlay={
        <Menu onClick={onClickMenu}>
          {canOpenInDocumentViewer && (
            <Menu.Item key="document-viewer" icon={<FileOutlined />}>
              Open in Document Viewer
            </Menu.Item>
          )}
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
