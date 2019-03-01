import React from "react";
import { Table } from "antd";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import MinePermitTable from "@/components/mine/Permit/MinePermitTable";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
};

const defaultProps = {
  partyRelationships: [],
};

export const MinePermitInfo = (props) => [<div>test</div>, <br />, <MinePermitTable {...props} />];

const mapStateToProps = (state) => ({});

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;

export default connect(mapStateToProps)(MinePermitInfo);
