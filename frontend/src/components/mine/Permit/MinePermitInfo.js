import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

import { Icon, Button, Row, Col } from "antd";
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

export const MinePermitInfo = (props) => [
  <div>
    <div className="inline-flex between">
      <div />
      <div className="inline-flex between">
        <AuthorizationWrapper
          permission={Permission.CREATE}
          isMajorMine={props.mine.major_mine_ind}
        >
          <Button type="primary">
            <Icon type="plus-circle" theme="outlined" style={{ fontSize: "16px" }} />
            &nbsp; Add New Permit
          </Button>
        </AuthorizationWrapper>
      </div>
    </div>
  </div>,
  <br />,
  <MinePermitTable {...props} />,
];

const mapStateToProps = (state) => ({});

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;

export default connect(mapStateToProps)(MinePermitInfo);
