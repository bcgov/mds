import React, { Component } from "react";
import { connect } from "react-redux";
import { Dropdown, Menu, Popconfirm, Button } from "antd";
import PropTypes from "prop-types";
import { TRASHCAN, EDIT_OUTLINE_VIOLET, CARAT } from "@/constants/assets";
import { DownloadOutlined } from "@ant-design/icons";
import CustomPropTypes from "@/customPropTypes";
import { getDocumentDownloadToken } from "@common/utils/actionlessNetworkCalls";
import { setMineReportDownloadState } from "@common/actionCreators/reportActionCreator";

const propTypes = {
  mineReport: CustomPropTypes.mineReport.isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
  setMineReportDownloadState: PropTypes.func.isRequired,
  mineReportRecord: PropTypes.func.isRequired,
  renderDeleteButtonForPermitAmendments: PropTypes.func.isRequired,
};

const defaultProps = {};

export class MineReportActions extends Component {
  state = {
    cancelDownload: false,
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

    const reportSubmissions = this.props.mineReport.mine_report_submissions[
      this.props.mineReport.mine_report_submissions.length - 1
    ].documents.map((doc) => ({
      key: doc.mine_document_guid,
      documentManagerGuid: doc.document_manager_guid,
      filename: doc.document_name,
    }));

    const totalFiles = reportSubmissions.length;
    if (totalFiles === 0) {
      return;
    }

    reportSubmissions.forEach((doc) =>
      getDocumentDownloadToken(doc.documentManagerGuid, doc.filename, docURLS)
    );

    let currentFile = 0;
    this.waitFor(() => docURLS.length === reportSubmissions.length).then(async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const url of docURLS) {
        if (this.state.cancelDownload) {
          this.setState({ cancelDownload: false });
          setMineReportDownloadState({
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
        setMineReportDownloadState({
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

      setMineReportDownloadState({
        downloading: false,
        currentFile: 1,
        totalFiles: 1,
      });
    });
  };

  DeleteButton = (state, props) =>
    ({
      hasFiles: (
        <Popconfirm
          placement="topLeft"
          title={`Are you sure you want to delete the ${this.props.mineReport.submission_year} ${this.props.mineReport.report_name}?`}
          onConfirm={() => this.props.handleRemoveReport(this.props.mineReport)}
          okText="Delete"
          cancelText="Cancel"
        >
          <Button ghost type="primary" size="small">
            <div>
              <img
                name="remove"
                className="padding-sm"
                src={TRASHCAN}
                alt="Remove Activity"
                style={{ paddingRight: "15px" }}
              />
              Delete
            </div>
          </Button>
        </Popconfirm>
      ),
      noFiles: (
        <Popconfirm
          placement="topLeft"
          title={`Are you sure you want to delete the ${this.props.mineReport.submission_year} ${this.props.mineReport.report_name}?`}
          onConfirm={() => this.props.handleRemoveReport(this.props.mineReport)}
          okText="Delete"
          cancelText="Cancel"
        >
          <Button ghost type="primary" size="small">
            <div>
              <img
                name="remove"
                className="padding-sm"
                src={TRASHCAN}
                alt="Remove Activity"
                style={{ paddingRight: "15px" }}
              />
              Delete
            </div>
          </Button>
        </Popconfirm>
      ),
    }[state]);

  renderDeleteButton = (props) => {
    const hasFiles =
      props.mineReport.mine_report_submissions &&
      props.mineReport.mine_report_submissions.length > 0 &&
      props.mineReport.mine_report_submissions[props.mineReport.mine_report_submissions.length - 1]
        .documents.length > 0;
    if (hasFiles) return this.DeleteButton("hasFiles", props);
    return this.DeleteButton("noFiles", props);
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
              this.props.openEditReportModal(
                event,
                this.props.handleEditReport,
                this.props.mineReport
              )
            }
          >
            <img
              src={EDIT_OUTLINE_VIOLET}
              alt="Edit Report"
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
        <Menu.Item key="2">{this.renderDeleteButton(this.props)}</Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} placement="bottomLeft">
        <Button className="permit-table-button" type="secondary">
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

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setMineReportDownloadState,
    },
    dispatch
  );

MineReportActions.propTypes = propTypes;
MineReportActions.defaultProps = defaultProps;

export default connect(null, mapDispatchToProps)(MineReportActions);
