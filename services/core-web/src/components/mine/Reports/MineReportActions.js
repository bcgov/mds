import React, { Component } from "react";
import { Dropdown, Menu, Popconfirm, Button } from "antd";
import PropTypes from "prop-types";
import { TRASHCAN, EDIT_OUTLINE_VIOLET, CARAT } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import DownloadAllDocuments from "@/components/common/DownloadAllDocuments";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";

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
        <AuthorizationWrapper permission={Permission.ADMIN}>
          <Popconfirm
            placement="topLeft"
            title={`Are you sure you want to delete the ${this.props.mineReport.submission_year} ${this.props.mineReport.report_name}?`}
            onConfirm={() => this.props.handleRemoveReport(this.props.mineReport)}
            okText="Delete"
            cancelText="Cancel"
          >
            <div className="custom-menu-item">
              <button type="button" className="full add-permit-dropdown-button">
                <img
                  name="remove"
                  className="icon-sm padding-sm--right violet"
                  src={TRASHCAN}
                  alt="Remove Activity"
                />
                Delete
              </button>
            </div>
          </Popconfirm>
        </AuthorizationWrapper>
      ),
      noFiles: (
        <AuthorizationWrapper permission={Permission.ADMIN}>
          <Popconfirm
            placement="topLeft"
            title={`Are you sure you want to delete the ${this.props.mineReport.submission_year} ${this.props.mineReport.report_name}?`}
            onConfirm={() => this.props.handleRemoveReport(this.props.mineReport)}
            okText="Delete"
            cancelText="Cancel"
          >
            <div className="custom-menu-item">
              <button type="button" className="full add-permit-dropdown-button">
                <img
                  name="remove"
                  className="icon-sm padding-sm--right violet"
                  src={TRASHCAN}
                  alt="Remove Activity"
                />
                Delete
              </button>
            </div>
          </Popconfirm>
        </AuthorizationWrapper>
      ),
    }[state]);

  renderDeleteButton = () => {
    const hasFiles =
      this.props.mineReport.mine_report_submissions &&
      this.props.mineReport.mine_report_submissions.length > 0 &&
      this.props.mineReport.mine_report_submissions[
        this.props.mineReport.mine_report_submissions.length - 1
      ].documents.length > 0;
    if (hasFiles) return this.DeleteButton("hasFiles", this.props);
    return this.DeleteButton("noFiles", this.props);
  };

  reportDocuments = () => {
    if (this.props.mineReport.mine_report_submissions) {
      return this.props.mineReport.mine_report_submissions[
        this.props.mineReport.mine_report_submissions.length - 1
      ].documents.map((doc) => ({
        key: doc.mine_document_guid,
        documentManagerGuid: doc.document_manager_guid,
        filename: doc.document_name,
      }));
    }
    return;
  };

  render() {
    const menu = (
      <Menu>
        <AuthorizationWrapper permission={Permission.ADMIN}>
          <Menu.Item key="0">
            <div className="custom-menu-item">
              <button
                type="button"
                className="full add-permit-dropdown-button"
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
                  className="icon-sm padding-sm--right violet"
                  style={{ paddingLeft: "13px" }}
                />
                Edit
              </button>
            </div>
          </Menu.Item>
        </AuthorizationWrapper>
        <Menu.Item key="1">
          <DownloadAllDocuments documents={this.reportDocuments()} />
        </Menu.Item>
        <Menu.Item key="2">{this.renderDeleteButton()}</Menu.Item>
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
