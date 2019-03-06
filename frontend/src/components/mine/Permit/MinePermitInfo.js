import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  fetchPermits,
  fetchPermitStatusOptions,
  createPermit,
} from "@/actionCreators/permitActionCreator";
import { Icon, Button } from "antd";
import MinePermitTable from "@/components/mine/Permit/MinePermitTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { getPermits } from "../../../reducers/permitReducer";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createPermit: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchPermitStatusOptions: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationships: [],
  permits: [],
};

export class MinePermitInfo extends Component {
  componentWillMount() {
    this.props.fetchPermits({ mine_guid: this.props.mine.guid });
    this.props.fetchPermitStatusOptions();
  }

  openAddPermitModal = (event, onSubmit, title) => {
    event.preventDefault();

    this.props.openModal({
      props: {
        onSubmit,
        title,
      },
      content: modalConfig.ADD_PERMIT,
    });
  };

  handleAddPermit = (values) => {
    const payload = { mine_guid: this.props.mine.guid, ...values };
    payload.permit_no = `${values.permit_type}${values.permit_activity_type || ""}-${
      values.permit_no
    }`;
    this.props.closeModal();
    return this.props.createPermit(payload).then(() => {
      this.props.fetchPermits({ mine_guid: this.props.mine.guid });
    });
  };

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
                  Add a New Permit
                </Button>
              </AuthorizationWrapper>
            </AuthorizationWrapper>
          </div>
        </div>
      </div>,
      <br />,
      this.props.permits && (
        <MinePermitTable
          permits={this.props.permits}
          partyRelationships={this.props.partyRelationships}
          major_mine_ind={this.props.mine.major_mine_ind}
          openModal={this.props.openModal}
          closeModal={() => {
            this.props.fetchPermits({ mine_guid: this.props.mine.guid });
            this.props.closeModal();
          }}
        />
      ),
    ];
  }
}

const mapStateToProps = (state) => ({
  permits: getPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchPermits,
      fetchPermitStatusOptions,
      createPermit,
    },
    dispatch
  );

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MinePermitInfo);
