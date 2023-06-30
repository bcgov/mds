import React, { FC } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Dropdown, Menu, Button } from "antd";
import { CARAT } from "@/constants/assets";
import { DownloadOutlined, FileOutlined } from "@ant-design/icons";
import { openDocument, isDocumentOpenable } from "@/components/syncfusion/DocumentViewer";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";

interface DocumentActionsProps {
  document: { documentName: string; documentMangerGuid: string };
  openDocument: (arg1: string, arg2: string) => any;
}

export const DocumentActions: FC<DocumentActionsProps> = (props) => {
  const downloadOnClick = (document) =>
    document.documentMangerGuid
      ? downloadFileFromDocumentManager({
          document_manager_guid: document.documentMangerGuid,
          document_name: document.documentName,
        })
      : null;

  const canOpenInDocumentViewer = (document) =>
    document.documentMangerGuid && isDocumentOpenable(document.documentName);

  const openInDocumentViewerOnClick = (document) =>
    document.documentMangerGuid
      ? props.openDocument(document.documentMangerGuid, document.documentName)
      : null;

  const menu = (
    <Menu>
      {canOpenInDocumentViewer(props.document) && (
        <Menu.Item key="0" icon={<FileOutlined />}>
          <button
            type="button"
            className="full add-permit-dropdown-button"
            onClick={() => {
              openInDocumentViewerOnClick(props.document);
            }}
          >
            <div>Open in Document Viewer</div>
          </button>
        </Menu.Item>
      )}
      <Menu.Item key="1" icon={<DownloadOutlined />}>
        <button
          type="button"
          className="full add-permit-dropdown-button"
          onClick={() => {
            downloadOnClick(props.document);
          }}
        >
          <div>Download File</div>
        </button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      {/* @ts-ignore */}
      <Dropdown overlay={menu} placement="bottomLeft">
        {/* @ts-ignore */}
        <Button type="secondary" className="permit-table-button">
          Actions
          <img
            className="padding-sm--right icon-svg-filter"
            src={CARAT}
            alt="Menu"
            style={{ paddingLeft: "5px" }}
          />
        </Button>
      </Dropdown>
    </div>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openDocument,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(DocumentActions);
