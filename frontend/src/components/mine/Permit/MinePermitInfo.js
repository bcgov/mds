import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  fetchPermits,
  createPermit,
  updatePermit,
  updatePermitAmendment,
  createPermitAmendment,
} from "@/actionCreators/permitActionCreator";
import { Icon, Button } from "antd";
import MinePermitTable from "@/components/mine/Permit/MinePermitTable";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { getPermits } from "../../../reducers/permitReducer";
/**
 * @class  MinePermitInfo - contains all permit information
 */

const amalgamtedPermit = "ALG";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit),
  partyRelationships: PropTypes.arrayOf(CustomPropTypes.partyRelationship),
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createPermit: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  updatePermit: PropTypes.func.isRequired,
  updatePermitAmendment: PropTypes.func.isRequired,
  createPermitAmendment: PropTypes.func.isRequired,
};

const defaultProps = {
  partyRelationships: [],
  permits: [],
};

export class MinePermitInfo extends Component {
  componentWillMount() {
    this.props.fetchPermits({ mine_guid: this.props.mine.guid });
  }

  closePermitModal = () => {
    this.props.closeModal();
    this.props.fetchPermits({ mine_guid: this.props.mine.guid });
  };

  // Permit Modals

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

  openEditPermitModal = (event, permit) => {
    event.preventDefault();
    const initialValues = { ...permit };

    this.props.openModal({
      props: {
        initialValues,
        onSubmit: this.handleEditPermit,
        title: `Edit permit status for ${permit.permit_no}`,
      },
      content: modalConfig.EDIT_PERMIT,
    });
  };

  // Permit Handlers

  handleAddPermit = (values) => {
    const payload = { mine_guid: this.props.mine.guid, ...values };

    payload.permit_no = `${values.permit_type}${values.permit_activity_type || ""}-${
      values.permit_no
    }`;

    return this.props.createPermit(payload).then(this.closePermitModal);
  };

  handleEditPermit = (values) =>
    this.props.updatePermit(values.permit_guid, values).then(this.closePermitModal);

  // Amendment Modals

  openAddAmendmentModal = (event, onSubmit, title, permit) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          related_documents: [],
          mine_guid: permit.mine_guid,
          permit_guid: permit.permit_guid,
        },
        onSubmit,
        title,
        mine_guid: permit.mine_guid,
      },
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  openEditAmendmentModal = (event, permit_amendment, permit) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          ...permit_amendment,
        },
        onSubmit: this.handleEditPermitAmendment,
        title: `Edit permit amendment for ${permit.permit_no}`,
        mine_guid: permit.mine_guid,
      },
      content: modalConfig.PERMIT_AMENDMENT,
    });
  };

  openAddAmalgamatedPermitModal = (event, permit) =>
    this.openAddAmendmentModal(
      event,
      this.handleAddAlgPermitAmendment,
      `Add amalgamated permit to ${permit.permit_no}`,
      permit
    );

  openAddPermitAmendmentModal = (event, permit) =>
    this.openAddAmendmentModal(
      event,
      this.handleAddPermitAmendment,
      `Add permit amendment to ${permit.permit_no}`,
      permit
    );

  // Amendment Handlers

  handleEditPermitAmendment = (values) =>
    this.props
      .updatePermitAmendment(values.permit_amendment_guid, values)
      .then(this.closePermitModal);

  handleAddPermitAmendment = (values) => {
    this.props.createPermitAmendment(values.permit_guid, values).then(this.closePermitModal);
  };

  handleAddAmalgamatedPermit = (values) =>
    this.props
      .createPermitAmendment(values.permit_guid, {
        ...values,
        permit_amendment_type_code: amalgamtedPermit,
      })
      .then(this.closePermitModal);

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
          openEditPermitModal={this.openEditPermitModal}
          openEditAmendmentModal={this.openEditAmendmentModal}
          openAddPermitAmendmentModal={this.openAddPermitAmendmentModal}
          openAddAmalgamatedPermitModal={this.openAddAmalgamatedPermitModal}
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
      createPermit,
      updatePermit,
      updatePermitAmendment,
      createPermitAmendment,
    },
    dispatch
  );

MinePermitInfo.propTypes = propTypes;
MinePermitInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MinePermitInfo);
