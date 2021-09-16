import React, { Component } from "react";
import { Dropdown, Menu, Button, notification } from "antd";
import PropTypes from "prop-types";
import { EDIT_OUTLINE_VIOLET, CARAT } from "@/constants/assets";
import { DownloadOutlined } from "@ant-design/icons";
import CustomPropTypes from "@/customPropTypes";
import { getDocumentDownloadToken } from "@common/utils/actionlessNetworkCalls";

const propTypes = {
  permitAmendment: CustomPropTypes.permitAmendment.isRequired,
  permit: CustomPropTypes.permit.isRequired,
  openEditAmendmentModal: PropTypes.func.isRequired,
  minePermitRecord: PropTypes.func.isRequired,
  minePermitText: PropTypes.func.isRequired,
  renderDeleteButtonForPermitAmendments: PropTypes.func.isRequired,
};

const defaultProps = {};

export class MinePermitActions extends Component {
  downloadDocument = (url) => {
    const a = document.createElement("a");
    a.href = url.url;
    a.download = url.filename;
    a.style.display = "none";
    document.body.append(a);
    a.click();
    a.remove();
  };

  waitFor = (conditionFunction) => {
    const poll = (resolve) => {
      if (conditionFunction()) resolve();
      else setTimeout(() => poll(resolve), 400);
    };

    return new Promise(poll);
  };

  downloadDocumentPackage = () => {
    const docURLS = [];

    const permitAmendmentSubmissions = this.props.permit.permit_amendments[0].related_documents.map(
      (doc) => ({
        key: doc.mine_report_submission_guid,
        documentManagerGuid: doc.document_manager_guid,
        filename: doc.document_name,
      })
    );

    const totalFiles = permitAmendmentSubmissions.length;
    if (totalFiles === 0) {
      return;
    }

    permitAmendmentSubmissions.forEach((doc) =>
      getDocumentDownloadToken(doc.documentManagerGuid, doc.filename, docURLS)
    );

    let currentFile = 0;
    this.waitFor(() => docURLS.length === permitAmendmentSubmissions.length).then(async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const url of docURLS) {
        currentFile += 1;

        this.downloadDocument(url);

        // eslint-disable-next-line
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      notification.success({
        message: `Successfully Downloaded: ${totalFiles} files.`,
        duration: 10,
      });
    });
  };

  render() {
    const menu = (
      <Menu>
        <Menu.Item key="0">
          <Button
            ghost
            type="primary"
            className="full"
            onClick={(event) =>
              this.props.openEditAmendmentModal(
                event,
                this.props.permitAmendment,
                this.props.permit
              )
            }
          >
            <img
              src={EDIT_OUTLINE_VIOLET}
              alt="Edit"
              className="padding-sm"
              style={{ paddingRight: "15px" }}
            />
            Edit
          </Button>
        </Menu.Item>
        <Menu.Item key="1">
          <Button
            ghost
            type="primary"
            className="full"
            onClick={() => this.downloadDocumentPackage()}
          >
            <DownloadOutlined className="padding-sm" style={{ paddingRight: "15px" }} />
            Download All
          </Button>
        </Menu.Item>
        <Menu.Item key="2">
          {this.props.renderDeleteButtonForPermitAmendments(this.props.minePermitRecord)}
        </Menu.Item>
        <Menu.Item key="3">
          {this.props.renderVerifyCredentials(
            this.props.minePermitText,
            this.props.minePermitRecord
          )}
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} placement="bottomLeft">
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
    );
  }
}

MinePermitActions.propTypes = propTypes;
MinePermitActions.defaultProps = defaultProps;

export default MinePermitActions;
