/* eslint-disable */
import React from "react";
import { Icon, Popconfirm, Button } from "antd";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";

const propTypes = {
  mineReport: PropTypes.objectOf(CustomPropTypes.mineReport).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  handleRemoveReport: PropTypes.func.isRequired,
};

const defaultProps = {};

const DeleteButton = (state, props) =>
  ({
    hasFiles: (
      <Popconfirm
        placement="topLeft"
        title={`Are you sure you want to delete the ${props.mineReport.submission_year} ${props.mineReport.report_name}?`}
        onConfirm={() => props.handleRemoveReport(props.mineReport.mine_report_guid)}
        okText="Delete"
        cancelText="Cancel"
      >
        <Button ghost type="primary" size="small">
          <Icon type="minus-circle" theme="outlined" />
        </Button>
      </Popconfirm>
    ),
    noFiles: (
      <Popconfirm
        placement="topLeft"
        title={`Are you sure you want to delete the ${props.mineReport.submission_year} ${props.mineReport.report_name}?`}
        onConfirm={() => props.handleRemoveReport(props.mineReport.mine_report_guid)}
        okText="Delete"
        cancelText="Cancel"
      >
        <Button ghost type="primary" size="small">
          <Icon type="minus-circle" theme="outlined" />
        </Button>
      </Popconfirm>
    ),
  }[state]);

const renderDeleteButton = (props) => {
  const hasFiles =
    props.mineReport.mine_report_submissions &&
    props.mineReport.mine_report_submissions.length > 0 &&
    props.mineReport.mine_report_submissions[props.mineReport.mine_report_submissions.length - 1]
      .documents.length > 0;
  if (hasFiles) return DeleteButton("hasFiles", props);
  return DeleteButton("noFiles", props);
};

export const MineReportActions = (props) => (
  <div>
    <Button
      type="primary"
      size="small"
      ghost
      onClick={(event) =>
        props.openEditReportModal(event, props.handleEditReport, props.mineReport)
      }
    >
      <img src={EDIT_OUTLINE_VIOLET} alt="Edit Report" />
    </Button>
    {renderDeleteButton(props)}
  </div>
);

MineReportActions.propTypes = propTypes;
MineReportActions.defaultProps = defaultProps;

export default MineReportActions;
