import React from "react";
import { Popconfirm, Button } from "antd";
import PropTypes from "prop-types";
import { TRASHCAN, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mineReport: CustomPropTypes.mineReport.isRequired,
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
        onConfirm={() => props.handleRemoveReport(props.mineReport)}
        okText="Delete"
        cancelText="Cancel"
      >
        <Button ghost type="primary" size="small">
          <img name="remove" src={TRASHCAN} alt="Remove Activity" />
        </Button>
      </Popconfirm>
    ),
    noFiles: (
      <Popconfirm
        placement="topLeft"
        title={`Are you sure you want to delete the ${props.mineReport.submission_year} ${props.mineReport.report_name}?`}
        onConfirm={() => props.handleRemoveReport(props.mineReport)}
        okText="Delete"
        cancelText="Cancel"
      >
        <Button ghost type="primary" size="small">
          <img name="remove" src={TRASHCAN} alt="Remove Activity" />
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
  <div style={{ width: "max-content" }}>
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
