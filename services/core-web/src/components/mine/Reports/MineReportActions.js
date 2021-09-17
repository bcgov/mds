import React, { Component } from "react";
import { Dropdown, Menu, Popconfirm, Button } from "antd";
import PropTypes from "prop-types";
import { TRASHCAN, EDIT_OUTLINE_VIOLET, CARAT } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import DownloadAllDocuments from "@/components/common/DownloadAllDocuments";

const propTypes = {
  mineReport: CustomPropTypes.mineReport.isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
  renderDeleteButtonForPermitAmendments: PropTypes.func.isRequired,
};

const defaultProps = {};

export class MineReportActions extends Component {
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
          <div className="custom-menu-item">
            <button type="button" className="full">
              <img
                name="remove"
                className="padding-sm"
                src={TRASHCAN}
                alt="Remove Activity"
                style={{ paddingRight: "15px" }}
              />
              Delete
            </button>
          </div>
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
    const reportSubmissions = this.props.mineReport.mine_report_submissions[
      this.props.mineReport.mine_report_submissions.length - 1
    ].documents.map((doc) => ({
      key: doc.mine_document_guid,
      documentManagerGuid: doc.document_manager_guid,
      filename: doc.document_name,
    }));
    const menu = (
      <Menu>
        <Menu.Item key="0">
          <button
            type="button"
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
          </button>
        </Menu.Item>
        <Menu.Item key="1">
          <DownloadAllDocuments submissions={reportSubmissions} />
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

MineReportActions.propTypes = propTypes;
MineReportActions.defaultProps = defaultProps;

export default MineReportActions;
