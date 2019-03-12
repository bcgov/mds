import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { Icon, Button } from "antd";
import MineApplicationTable from "@/components/mine/Applications/MineApplicationTable";
import * as ModalContent from "@/constants/modalContent";
import { getApplications } from "@/selectors/applicationSelectors";

/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  applications: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {};

export class MineApplicationInfo extends Component {
  componentWillMount() {}

  render() {
    return [
      <div>
        <div className="inline-flex between">
          <div />
          <div className="inline-flex between">
            <AuthorizationWrapper inTesting>
              <AuthorizationWrapper
                permission={Permission.CREATE}
                isMajorMine={this.props.mine.major_mine_ind}
              >
                <Button
                  type="primary"
                  onClick={(event) =>
                    this.openAddPermitModal(
                      event,
                      this.handleAddPermit,
                      `${ModalContent.ADD_PERMIT} to ${this.props.mine.mine_name}`
                    )
                  }
                >
                  <Icon type="plus" theme="outlined" style={{ fontSize: "18px" }} />
                  Add a New Application
                </Button>
              </AuthorizationWrapper>
            </AuthorizationWrapper>
          </div>
        </div>
      </div>,
      <br />,
      <MineApplicationTable
        applications={this.props.applications}
        major_mine_ind={this.props.mine.major_mine_ind}
      />,
    ];
  }
}

const mapStateToProps = (state) => ({
  applications: getApplications(state),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

MineApplicationInfo.propTypes = propTypes;
MineApplicationInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineApplicationInfo);
