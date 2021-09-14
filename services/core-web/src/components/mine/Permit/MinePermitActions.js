import React, { Component } from "react";
import { connect } from "react-redux";
import { Dropdown, Menu, Button } from "antd";
import PropTypes from "prop-types";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import { DownloadOutlined } from "@ant-design/icons";
import CustomPropTypes from "@/customPropTypes";
import { getDocumentDownloadToken } from "@common/utils/actionlessNetworkCalls";
import { setPermitAmendmentDownloadState } from "@common/actionCreators/permitActionCreator";
import { bindActionCreators } from "redux";

const propTypes = {
  permitAmendment: CustomPropTypes.permitAmendment.isRequired,
  permit: CustomPropTypes.permit.isRequired,
  openEditAmendmentModal: PropTypes.func.isRequired,
  setPermitAmendmentDownloadState: PropTypes.func.isRequired,
};

const defaultProps = {};

export class MinePermitActions extends Component {
  state = {
    cancelDownload: false,
  };

  cancelDownload = () => {
    this.setState({ cancelDownload: true });
  };

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
    console.log("this.props.permit", this.props.permit);
    console.log("this.props.permitAmendment", this.props.permitAmendment);

    const totalFiles = permitAmendmentSubmissions.length;
    if (totalFiles === 0) {
      return;
    }

    console.log("permitAmendmentSubmissions", permitAmendmentSubmissions);
    console.log("totalFiles", totalFiles);

    permitAmendmentSubmissions.forEach((doc) =>
      getDocumentDownloadToken(doc.documentManagerGuid, doc.filename, docURLS)
    );

    let currentFile = 0;
    this.waitFor(() => docURLS.length === permitAmendmentSubmissions.length).then(async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const url of docURLS) {
        if (this.state.cancelDownload) {
          this.setState({ cancelDownload: false });
          setPermitAmendmentDownloadState({
            downloading: false,
            currentFile: 0,
            totalFiles: 1,
          });
          notification.success({
            message: "Cancelled file downloads.",
            duration: 10,
          });
          return;
        }
        currentFile += 1;
        setPermitAmendmentDownloadState({
          downloading: true,
          currentFile,
          totalFiles,
        });
        this.downloadDocument(url);
        // eslint-disable-next-line
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      notification.success({
        message: `Successfully Downloaded: ${totalFiles} files.`,
        duration: 10,
      });

      setPermitAmendmentDownloadState({
        downloading: false,
        currentFile: 1,
        totalFiles: 1,
      });
    });
  };

  render() {
    console.log("this.props.permitAmendment", this.props.permitAmendment);
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
            <div>
              <img src={EDIT_OUTLINE_VIOLET} alt="Edit Report" />
            </div>
          </Button>
        </Menu.Item>
        <Menu.Item key="1">
          <Button
            ghost
            type="primary"
            className="full"
            onClick={() => this.downloadDocumentPackage()}
          >
            <DownloadOutlined className="padding-sm--right icon-sm" />
          </Button>
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} placement="bottomLeft">
        <Button type="secondary">Actions</Button>
      </Dropdown>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setPermitAmendmentDownloadState,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(MinePermitActions);
