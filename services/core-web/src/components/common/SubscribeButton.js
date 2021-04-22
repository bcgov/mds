import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Popconfirm, Tooltip } from "antd";
import { SUBSCRIBE } from "@/constants/assets";
import { getCoreActivityTargetsHash } from "@common/selectors/activitySelectors";
import { createCoreActivityTarget, deleteCoreActivityTarget } from "@common/actionCreators/activityActionCreator";

const propTypes = {
    target_guid: PropTypes.string.isRequired,
    coreActivityTargetsHash: PropTypes.objectOf(PropTypes.any).isRequired,
};

export class SubscribeButton extends Component {
  render = () => {
  return <div>{
        typeof this.props.coreActivityTargetsHash[this.props.target_guid] === 'undefined' ?
      (
        <Tooltip title="Subscribe" placement="right">
          <button type="button" onClick={(event) => this.props.createCoreActivityTarget(this.props.target_guid)}>
            <img alt="document" src={SUBSCRIBE} style={{opacity:"25%"}} />
          </button>
        </Tooltip>)
      : (
        <Tooltip title="Unsubscribe" placement="right">
        <button type="button" onClick={(event) => this.props.deleteCoreActivityTarget(this.props.target_guid)}>
            <img alt="document" src={SUBSCRIBE} />
          </button>
        </Tooltip>
  )}
  </div>
  };
}

SubscribeButton.propTypes = propTypes;

const mapStateToProps = (state) => ({
    coreActivityTargetsHash: getCoreActivityTargetsHash(state),
  });
  
const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
      {
        createCoreActivityTarget,
        deleteCoreActivityTarget,
      },
      dispatch
    );


export default connect(mapStateToProps, mapDispatchToProps)(SubscribeButton);
