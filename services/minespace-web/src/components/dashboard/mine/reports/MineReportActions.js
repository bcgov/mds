/* eslint-disable */
import React from "react";
import { Icon, Popconfirm, Button } from "antd";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_PENCIL } from "@/constants/assets";

const propTypes = {
  mineReport: PropTypes.objectOf(CustomPropTypes.mineReport).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  handleEditReport: PropTypes.func.isRequired,
};

const defaultProps = {};

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
      <img src={EDIT_PENCIL} alt="Edit Report" />
    </Button>
  </div>
);

MineReportActions.propTypes = propTypes;
MineReportActions.defaultProps = defaultProps;

export default MineReportActions;
