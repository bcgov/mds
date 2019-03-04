import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { fetchPermits } from "@/actionCreators/permitActionCreator";
import { Icon, Button, Row, Col } from "antd";
import MinePermitTable from "@/components/mine/Permit/MinePermitTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { getPermits } from "../../../reducers/permitReducer";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const propTypes = {
  fetchPermits: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationships: [],
  permits: [],
};

export class MinePermitInfo extends Component {
  componentWillMount() {
    const id = this.props.mine.guid;
    this.props.fetchPermits({ mine_guid: id }).then(() => console.log(this.props.permits));
  }

  openAddPermitModal = (event, onSubmit, title) => {
    event.preventDefault();

    const handleDelete = () => {};
    const initialValues = {};

    this.props.openModal({
      props: {
        handleDelete,
        onSubmit,
        title,
        initialValues,
      },
      content: modalConfig.ADD_PERMIT,
    });
  };

  handleAddPermit = (value) => {
    alert(JSON.stringify(value));
  };

  render() {
    return [
      <div>
        <div className="inline-flex between">
          <div />
          <div className="inline-flex between">
            <AuthorizationWrapper
              permission={Permission.CREATE}
              isMajorMine={this.props.mine.major_mine_ind}
            >
              <Button
                type="primary"
                onClick={(event) =>
                  this.openAddPermitModal(event, this.handleAddPermit, ModalContent.ADD_PERMIT)
                }
              >
                <Icon type="plus-circle" theme="outlined" style={{ fontSize: "16px" }} />
                &nbsp; {ModalContent.ADD_PERMIT}
              </Button>
            </AuthorizationWrapper>
          </div>
        </div>
      </div>,
      <br />,
      this.props.permits && this.props.permits.length > 0 && (
        <MinePermitTable
          permits={this.props.permits}
          partyRelationships={this.props.partyRelationships}
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
    },
    dispatch
  );

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MinePermitInfo);
